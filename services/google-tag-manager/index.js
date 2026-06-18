import { google } from "googleapis";

const TAG_MANAGER_SCOPE = "https://www.googleapis.com/auth/tagmanager.readonly";

function cleanTagManagerId(value) {
  return String(value || "")
    .trim()
    .replace(/^accounts\//, "")
    .replace(/^containers\//, "")
    .replace(/\/$/, "");
}

function isPublicContainerId(containerId) {
  return /^GTM-[A-Z0-9]+$/i.test(containerId);
}

function getGoogleTagManagerConfig(accountIdOverride, containerIdOverride) {
  const accountId = cleanTagManagerId(
    accountIdOverride || process.env.GOOGLE_TAG_MANAGER_ACCOUNT_ID
  );
  const containerId = cleanTagManagerId(
    containerIdOverride || process.env.GOOGLE_TAG_MANAGER_CONTAINER_ID
  );
  const clientEmail =
    process.env.GOOGLE_TAG_MANAGER_CLIENT_EMAIL ||
    process.env.GOOGLE_SERVICE_ACCOUNT_CLIENT_EMAIL;
  const privateKey = (
    process.env.GOOGLE_TAG_MANAGER_PRIVATE_KEY ||
    process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY ||
    ""
  ).replace(/\\n/g, "\n");

  if (!containerId) {
    throw new Error(
      "Missing GTM container ID. Select a project with GTM Container ID or set GOOGLE_TAG_MANAGER_CONTAINER_ID."
    );
  }

  if (!accountId && !isPublicContainerId(containerId)) {
    throw new Error(
      "Missing GTM account ID. Add GTM Account ID, or use a public container ID like GTM-XXXX so the account can be discovered."
    );
  }

  if (!clientEmail || !privateKey) {
    throw new Error(
      "Missing GTM credentials. Set GOOGLE_TAG_MANAGER_CLIENT_EMAIL and GOOGLE_TAG_MANAGER_PRIVATE_KEY, or reuse GOOGLE_SERVICE_ACCOUNT_CLIENT_EMAIL and GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY."
    );
  }

  return {
    accountId,
    clientEmail,
    containerId,
    privateKey,
  };
}

function createTagManagerClient(accountIdOverride, containerIdOverride) {
  const { clientEmail, privateKey } = getGoogleTagManagerConfig(
    accountIdOverride,
    containerIdOverride
  );
  const auth = new google.auth.JWT({
    email: clientEmail,
    key: privateKey,
    scopes: [TAG_MANAGER_SCOPE],
  });

  return google.tagmanager({
    auth,
    version: "v2",
  });
}

function getContainerPath(accountId, containerId) {
  return `accounts/${accountId}/containers/${containerId}`;
}

function getAccountPath(accountId) {
  return `accounts/${accountId}`;
}

async function listContainersForAccount(tagManager, accountId) {
  const response = await tagManager.accounts.containers.list({
    parent: getAccountPath(accountId),
  });

  return response.data.container || [];
}

async function resolveContainer(tagManager, accountId, containerId) {
  if (!isPublicContainerId(containerId)) {
    return {
      accountId,
      containerId,
      publicId: "",
    };
  }

  const normalizedPublicId = containerId.toUpperCase();
  const containers = accountId
    ? await listContainersForAccount(tagManager, accountId)
    : await tagManager.accounts
        .list()
        .then((response) => response.data.account || [])
        .then((accounts) =>
          Promise.all(
            accounts.map((account) =>
              listContainersForAccount(tagManager, account.accountId)
            )
          )
        )
        .then((accountContainers) => accountContainers.flat());
  const container = containers.find(
    (item) => item.publicId?.toUpperCase() === normalizedPublicId
  );

  if (!container) {
    throw new Error(
      `GTM container ${containerId} was not found for this service account. Confirm the service account has access in GTM Admin.`
    );
  }

  return {
    accountId: container.accountId,
    containerId: container.containerId,
    publicId: container.publicId,
  };
}

function pickWorkspace(workspaces) {
  return (
    workspaces.find((workspace) => workspace.name === "Default Workspace") ||
    workspaces[0] ||
    null
  );
}

function formatParameterValue(parameter) {
  if (!parameter) {
    return "";
  }

  if (parameter.value !== undefined) {
    return parameter.value;
  }

  if (parameter.list) {
    return `${parameter.list.length} values`;
  }

  if (parameter.map) {
    return `${parameter.map.length} fields`;
  }

  return "";
}

function getTagTypeLabel(type) {
  const labels = {
    gaawe: "GA4 Event",
    googtag: "Google Tag",
    html: "Custom HTML",
  };

  return labels[type] || type || "Unknown";
}

function normalizeTag(tag) {
  const firingTriggerIds = tag.firingTriggerId || [];

  return {
    accountId: tag.accountId || "",
    containerId: tag.containerId || "",
    name: tag.name || "Untitled Tag",
    paused: Boolean(tag.paused),
    tagId: tag.tagId || "",
    type: tag.type || "",
    typeLabel: getTagTypeLabel(tag.type),
    firingTriggerIds,
    firingTriggerCount: firingTriggerIds.length,
  };
}

function normalizeTrigger(trigger) {
  return {
    name: trigger.name || "Untitled Trigger",
    triggerId: trigger.triggerId || "",
    type: trigger.type || "Unknown",
  };
}

function normalizeVariable(variable) {
  const parameters = variable.parameter || [];

  return {
    name: variable.name || "Untitled Variable",
    type: variable.type || "Unknown",
    value: formatParameterValue(parameters[0]),
    variableId: variable.variableId || "",
  };
}

export async function getGoogleTagManagerDashboard(
  accountIdOverride,
  containerIdOverride
) {
  const { accountId, containerId } = getGoogleTagManagerConfig(
    accountIdOverride,
    containerIdOverride
  );
  const tagManager = createTagManagerClient(accountId, containerId);
  const resolvedContainer = await resolveContainer(
    tagManager,
    accountId,
    containerId
  );
  const containerPath = getContainerPath(
    resolvedContainer.accountId,
    resolvedContainer.containerId
  );

  const [containerResponse, workspacesResponse] = await Promise.all([
    tagManager.accounts.containers.get({
      path: containerPath,
    }),
    tagManager.accounts.containers.workspaces.list({
      parent: containerPath,
    }),
  ]);

  const container = containerResponse.data;
  const workspaces = workspacesResponse.data.workspace || [];
  const selectedWorkspace = pickWorkspace(workspaces);
  const workspacePath = selectedWorkspace?.path;

  if (!workspacePath) {
    return {
      accountId: resolvedContainer.accountId,
      container,
      containerId: resolvedContainer.containerId,
      overview: {
        tags: 0,
        triggers: 0,
        variables: 0,
        workspaces: workspaces.length,
      },
      tags: [],
      triggers: [],
      variables: [],
      workspace: null,
      workspaces,
    };
  }

  const [tagsResponse, triggersResponse, variablesResponse] = await Promise.all([
    tagManager.accounts.containers.workspaces.tags.list({
      parent: workspacePath,
    }),
    tagManager.accounts.containers.workspaces.triggers.list({
      parent: workspacePath,
    }),
    tagManager.accounts.containers.workspaces.variables.list({
      parent: workspacePath,
    }),
  ]);

  const tags = tagsResponse.data.tag || [];
  const triggers = triggersResponse.data.trigger || [];
  const variables = variablesResponse.data.variable || [];

  return {
    accountId: resolvedContainer.accountId,
    container,
    containerId: resolvedContainer.containerId,
    overview: {
      tags: tags.length,
      triggers: triggers.length,
      variables: variables.length,
      workspaces: workspaces.length,
    },
    tags: tags.map(normalizeTag),
    triggers: triggers.map(normalizeTrigger),
    variables: variables.map(normalizeVariable),
    workspace: selectedWorkspace,
    workspaces,
  };
}
