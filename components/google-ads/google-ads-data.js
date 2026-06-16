export const googleAdsData = {
  kpis: [
    {
      label: "Total Spend",
      value: "$42,860",
      change: "+8.4% vs last month",
    },
    {
      label: "Clicks",
      value: "128.4K",
      change: "+12.1% click volume",
    },
    {
      label: "Impressions",
      value: "4.8M",
      change: "+18.7% reach",
    },
    {
      label: "CTR",
      value: "2.68%",
      change: "+0.4 pts",
    },
    {
      label: "Conversions",
      value: "3,284",
      change: "+9.6% growth",
    },
    {
      label: "ROAS",
      value: "4.7x",
      change: "+0.8x efficiency",
    },
  ],
  campaigns: [
    {
      name: "Brand Search - India",
      status: "Active",
      spend: "$8,420",
      clicks: "32,480",
      ctr: "6.8%",
      conversions: "924",
    },
    {
      name: "Competitor Search",
      status: "Learning",
      spend: "$6,910",
      clicks: "18,210",
      ctr: "3.1%",
      conversions: "418",
    },
    {
      name: "Performance Max - Ecommerce",
      status: "Active",
      spend: "$14,680",
      clicks: "41,730",
      ctr: "2.4%",
      conversions: "1,126",
    },
    {
      name: "Remarketing - High Intent",
      status: "Active",
      spend: "$5,340",
      clicks: "22,140",
      ctr: "4.9%",
      conversions: "612",
    },
    {
      name: "YouTube Awareness",
      status: "Limited",
      spend: "$7,510",
      clicks: "13,840",
      ctr: "1.2%",
      conversions: "204",
    },
  ],
  trend: [
    { day: "Mon", spend: 5200, conversions: 350 },
    { day: "Tue", spend: 6100, conversions: 420 },
    { day: "Wed", spend: 5800, conversions: 390 },
    { day: "Thu", spend: 6900, conversions: 510 },
    { day: "Fri", spend: 7200, conversions: 560 },
    { day: "Sat", spend: 6400, conversions: 480 },
    { day: "Sun", spend: 5260, conversions: 574 },
  ],
  recommendations: [
    {
      title: "Shift budget to Performance Max",
      description:
        "Performance Max is producing the strongest conversion volume at a stable ROAS. Move 12% budget from low-intent awareness campaigns.",
      priority: "High",
    },
    {
      title: "Reduce competitor search CPC pressure",
      description:
        "Competitor Search has rising CPC and lower conversion density. Tighten match types and exclude low-quality queries.",
      priority: "Medium",
    },
    {
      title: "Refresh remarketing creative",
      description:
        "Remarketing CTR is strong, but conversion rate has flattened. Test new urgency-led ad copy and offer-led extensions.",
      priority: "Medium",
    },
  ],
};
