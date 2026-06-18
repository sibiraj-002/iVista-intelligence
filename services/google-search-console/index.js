import { google } from "googleapis";

import {
  getComparisonDateRanges,
  getPercentChange,
  resolveDateRange,
} from "@/utils/date-range";

const SEARCH_CONSOLE_SCOPE = "https://www.googleapis.com/auth/webmasters.readonly";
const countryDisplayNames = new Intl.DisplayNames(["en"], { type: "region" });
const ISO_ALPHA3_TO_ALPHA2 = {
  afg: "AF",
  ala: "AX",
  alb: "AL",
  dza: "DZ",
  asm: "AS",
  and: "AD",
  ago: "AO",
  aia: "AI",
  ata: "AQ",
  atg: "AG",
  arg: "AR",
  arm: "AM",
  abw: "AW",
  aus: "AU",
  aut: "AT",
  aze: "AZ",
  bhs: "BS",
  bhr: "BH",
  bgd: "BD",
  brb: "BB",
  blr: "BY",
  bel: "BE",
  blz: "BZ",
  ben: "BJ",
  bmu: "BM",
  btn: "BT",
  bol: "BO",
  bes: "BQ",
  bih: "BA",
  bwa: "BW",
  bvt: "BV",
  bra: "BR",
  iot: "IO",
  brn: "BN",
  bgr: "BG",
  bfa: "BF",
  bdi: "BI",
  khm: "KH",
  cmr: "CM",
  can: "CA",
  cpv: "CV",
  cym: "KY",
  caf: "CF",
  tcd: "TD",
  chl: "CL",
  chn: "CN",
  cxr: "CX",
  cck: "CC",
  col: "CO",
  com: "KM",
  cog: "CG",
  cod: "CD",
  cok: "CK",
  cri: "CR",
  civ: "CI",
  hrv: "HR",
  cub: "CU",
  cuw: "CW",
  cyp: "CY",
  cze: "CZ",
  dnk: "DK",
  dji: "DJ",
  dma: "DM",
  dom: "DO",
  ecu: "EC",
  egy: "EG",
  slv: "SV",
  gnq: "GQ",
  eri: "ER",
  est: "EE",
  swz: "SZ",
  eth: "ET",
  flk: "FK",
  fro: "FO",
  fji: "FJ",
  fin: "FI",
  fra: "FR",
  guf: "GF",
  pyf: "PF",
  atf: "TF",
  gab: "GA",
  gmb: "GM",
  geo: "GE",
  deu: "DE",
  gha: "GH",
  gib: "GI",
  grc: "GR",
  grl: "GL",
  grd: "GD",
  glp: "GP",
  gum: "GU",
  gtm: "GT",
  ggy: "GG",
  gin: "GN",
  gnb: "GW",
  guy: "GY",
  hti: "HT",
  hmd: "HM",
  vat: "VA",
  hnd: "HN",
  hkg: "HK",
  hun: "HU",
  isl: "IS",
  ind: "IN",
  idn: "ID",
  irn: "IR",
  irq: "IQ",
  irl: "IE",
  imn: "IM",
  isr: "IL",
  ita: "IT",
  jam: "JM",
  jpn: "JP",
  jey: "JE",
  jor: "JO",
  kaz: "KZ",
  ken: "KE",
  kir: "KI",
  prk: "KP",
  kor: "KR",
  kwt: "KW",
  kgz: "KG",
  lao: "LA",
  lva: "LV",
  lbn: "LB",
  lso: "LS",
  lbr: "LR",
  lby: "LY",
  lie: "LI",
  ltu: "LT",
  lux: "LU",
  mac: "MO",
  mdg: "MG",
  mwi: "MW",
  mys: "MY",
  mdv: "MV",
  mli: "ML",
  mlt: "MT",
  mhl: "MH",
  mtq: "MQ",
  mrt: "MR",
  mus: "MU",
  myt: "YT",
  mex: "MX",
  fsm: "FM",
  mda: "MD",
  mco: "MC",
  mng: "MN",
  mne: "ME",
  msr: "MS",
  mar: "MA",
  moz: "MZ",
  mmr: "MM",
  nam: "NA",
  nru: "NR",
  npl: "NP",
  nld: "NL",
  ncl: "NC",
  nzl: "NZ",
  nic: "NI",
  ner: "NE",
  nga: "NG",
  niu: "NU",
  nfk: "NF",
  mkd: "MK",
  mnp: "MP",
  nor: "NO",
  omn: "OM",
  pak: "PK",
  plw: "PW",
  pse: "PS",
  pan: "PA",
  png: "PG",
  pry: "PY",
  per: "PE",
  phl: "PH",
  pcn: "PN",
  pol: "PL",
  prt: "PT",
  pri: "PR",
  qat: "QA",
  reu: "RE",
  rou: "RO",
  rus: "RU",
  rwa: "RW",
  blm: "BL",
  shn: "SH",
  kna: "KN",
  lca: "LC",
  maf: "MF",
  spm: "PM",
  vct: "VC",
  wsm: "WS",
  smr: "SM",
  stp: "ST",
  sau: "SA",
  sen: "SN",
  srb: "RS",
  syc: "SC",
  sle: "SL",
  sgp: "SG",
  sxm: "SX",
  svk: "SK",
  svn: "SI",
  slb: "SB",
  som: "SO",
  zaf: "ZA",
  sgs: "GS",
  ssd: "SS",
  esp: "ES",
  lka: "LK",
  sdn: "SD",
  sur: "SR",
  sjm: "SJ",
  swe: "SE",
  che: "CH",
  syr: "SY",
  twn: "TW",
  tjk: "TJ",
  tza: "TZ",
  tha: "TH",
  tls: "TL",
  tgo: "TG",
  tkl: "TK",
  ton: "TO",
  tto: "TT",
  tun: "TN",
  tur: "TR",
  tkm: "TM",
  tca: "TC",
  tuv: "TV",
  uga: "UG",
  ukr: "UA",
  are: "AE",
  gbr: "GB",
  usa: "US",
  umi: "UM",
  ury: "UY",
  uzb: "UZ",
  vut: "VU",
  ven: "VE",
  vnm: "VN",
  vgb: "VG",
  vir: "VI",
  wlf: "WF",
  esh: "EH",
  yem: "YE",
  zmb: "ZM",
  zwe: "ZW",
};

function getDateString(date) {
  return date.toISOString().slice(0, 10);
}

function getSearchConsoleDateRange(dateRangeOverride = {}) {
  if (dateRangeOverride.startDate && dateRangeOverride.endDate) {
    return dateRangeOverride;
  }

  return resolveDateRange({
    endDate: process.env.GOOGLE_SEARCH_CONSOLE_END_DATE,
    endOffsetDays: 2,
    range: dateRangeOverride.range,
    startDate: process.env.GOOGLE_SEARCH_CONSOLE_START_DATE,
  });
}

function getSearchConsoleConfig(siteUrlOverride) {
  const siteUrl =
    siteUrlOverride || process.env.GOOGLE_SEARCH_CONSOLE_SITE_URL || "";
  const clientEmail =
    process.env.GOOGLE_SEARCH_CONSOLE_CLIENT_EMAIL ||
    process.env.GOOGLE_SERVICE_ACCOUNT_CLIENT_EMAIL;
  const privateKey = (
    process.env.GOOGLE_SEARCH_CONSOLE_PRIVATE_KEY ||
    process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY ||
    ""
  ).replace(/\\n/g, "\n");

  if (!siteUrl) {
    throw new Error(
      "Missing Search Console site URL. Select a project with a Search Console Site URL or set GOOGLE_SEARCH_CONSOLE_SITE_URL."
    );
  }

  if (!clientEmail || !privateKey) {
    throw new Error(
      "Missing Search Console credentials. Set GOOGLE_SEARCH_CONSOLE_CLIENT_EMAIL and GOOGLE_SEARCH_CONSOLE_PRIVATE_KEY, or reuse GOOGLE_SERVICE_ACCOUNT_CLIENT_EMAIL and GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY."
    );
  }

  return {
    clientEmail,
    privateKey,
    siteUrl,
  };
}

function createSearchConsoleClient(siteUrlOverride) {
  const { clientEmail, privateKey } = getSearchConsoleConfig(siteUrlOverride);
  const auth = new google.auth.JWT({
    email: clientEmail,
    key: privateKey,
    scopes: [SEARCH_CONSOLE_SCOPE],
  });

  return google.searchconsole({
    auth,
    version: "v1",
  });
}

function formatDateForLabel(date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(new Date(`${date}T00:00:00`));
}

function formatDimensionValue(value, fallback = "Unknown") {
  return value || fallback;
}

function formatCountryName(value) {
  const normalizedValue = String(value || "").trim();

  if (!normalizedValue) {
    return "Unknown";
  }

  const regionCode =
    normalizedValue.length === 3
      ? ISO_ALPHA3_TO_ALPHA2[normalizedValue.toLowerCase()]
      : normalizedValue.toUpperCase();

  if (!regionCode) {
    return normalizedValue;
  }

  try {
    return countryDisplayNames.of(regionCode) || normalizedValue;
  } catch {
    return normalizedValue;
  }
}

function normalizeRow(row, keys = []) {
  return keys.reduce(
    (current, key, index) => ({
      ...current,
      [key]: row.keys?.[index] || "",
    }),
    {
      clicks: row.clicks || 0,
      impressions: row.impressions || 0,
      ctr: row.ctr || 0,
      position: row.position || 0,
    }
  );
}

function summarizeOverview(rows) {
  const totals = rows.reduce(
    (current, row) => ({
      clicks: current.clicks + (row.clicks || 0),
      impressions: current.impressions + (row.impressions || 0),
      weightedPosition:
        current.weightedPosition +
        (row.position || 0) * (row.impressions || 0),
    }),
    {
      clicks: 0,
      impressions: 0,
      weightedPosition: 0,
    }
  );

  return {
    averagePosition:
      totals.impressions > 0 ? totals.weightedPosition / totals.impressions : 0,
    clicks: totals.clicks,
    impressions: totals.impressions,
    ctr: totals.impressions > 0 ? totals.clicks / totals.impressions : 0,
    position:
      totals.impressions > 0 ? totals.weightedPosition / totals.impressions : 0,
  };
}

function getOverviewComparison(current, previous, twoPeriodsAgo) {
  return Object.fromEntries(
    ["clicks", "impressions", "ctr", "position"].map((key) => [
      key,
      {
        changeFromPrevious: getPercentChange(current[key], previous[key]),
        current: current[key],
        previous: previous[key],
        twoPeriodsAgo: twoPeriodsAgo[key],
      },
    ])
  );
}

export async function getSearchConsoleDashboard(
  siteUrlOverride,
  dateRangeOverride
) {
  const { siteUrl } = getSearchConsoleConfig(siteUrlOverride);
  const searchConsole = createSearchConsoleClient(siteUrlOverride);
  const dateRange = getSearchConsoleDateRange(dateRangeOverride);
  const comparisonDateRanges = getComparisonDateRanges(dateRange);

  async function runSearchAnalyticsQuery(
    dimensions = [],
    rowLimit = 25,
    queryDateRange = dateRange
  ) {
    const response = await searchConsole.searchanalytics.query({
      requestBody: {
        ...queryDateRange,
        dimensions,
        rowLimit,
      },
      siteUrl,
    });

    return response.data.rows || [];
  }

  const [
    overviewRows,
    previousOverviewRows,
    twoPeriodsAgoOverviewRows,
    trendRows,
    queryRows,
    pageRows,
    countryRows,
    deviceRows,
  ] =
    await Promise.all([
      runSearchAnalyticsQuery([], 1),
      runSearchAnalyticsQuery([], 1, comparisonDateRanges.previous),
      runSearchAnalyticsQuery([], 1, comparisonDateRanges.twoPeriodsAgo),
      runSearchAnalyticsQuery(["date"], 90),
      runSearchAnalyticsQuery(["query"], 25),
      runSearchAnalyticsQuery(["page"], 25),
      runSearchAnalyticsQuery(["country"], 25),
      runSearchAnalyticsQuery(["device"], 10),
    ]);

  const overview = overviewRows[0]
    ? normalizeRow(overviewRows[0])
    : summarizeOverview(trendRows);
  const previousOverview = previousOverviewRows[0]
    ? normalizeRow(previousOverviewRows[0])
    : summarizeOverview([]);
  const twoPeriodsAgoOverview = twoPeriodsAgoOverviewRows[0]
    ? normalizeRow(twoPeriodsAgoOverviewRows[0])
    : summarizeOverview([]);

  return {
    comparison: {
      dateRanges: comparisonDateRanges,
      overview: getOverviewComparison(
        overview,
        previousOverview,
        twoPeriodsAgoOverview
      ),
    },
    dateRange,
    overview,
    siteUrl,
    trend: trendRows.map((row) => {
      const item = normalizeRow(row, ["date"]);

      return {
        ...item,
        label: formatDateForLabel(item.date),
      };
    }),
    topQueries: queryRows.map((row) => normalizeRow(row, ["query"])),
    topPages: pageRows.map((row) => normalizeRow(row, ["page"])),
    countries: countryRows.map((row) => {
      const item = normalizeRow(row, ["country"]);

      return {
        ...item,
        country: formatCountryName(item.country),
      };
    }),
    devices: deviceRows.map((row) => {
      const item = normalizeRow(row, ["device"]);

      return {
        ...item,
        device: formatDimensionValue(item.device),
      };
    }),
  };
}
