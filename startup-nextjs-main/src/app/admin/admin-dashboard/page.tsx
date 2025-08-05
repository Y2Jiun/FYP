"use client";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
} from "firebase/firestore";
import AdminHeader from "@/components/Admin/AdminHeader";
import {
  FiTrendingUp,
  FiTrendingDown,
  FiDollarSign,
  FiHome,
  FiShield,
  FiUsers,
  FiBarChart2,
  FiPieChart,
  FiMapPin,
  FiClock,
  FiCheckCircle,
  FiAlertCircle,
  FiXCircle,
} from "react-icons/fi";

interface Property {
  propertyId: string;
  title: string;
  price: number;
  location: {
    address: string;
    city: string;
    neighborhood: string;
    zipCode: string;
  };
  propertyType: string;
  agentId: string;
  agentName: string;
  status: string;
  verificationStatus: {
    documents: string;
    details: string;
    images: string;
    overall: string;
  };
  trustScore?: number;
  trustBadge?: string;
  createdAt: any;
  updatedAt: any;
}

interface AnalyticsData {
  totalProperties: number;
  totalAgents: number;
  totalUsers: number;
  totalDocuments: number;
  verifiedProperties: number;
  pendingProperties: number;
  rejectedProperties: number;
  averageTrustScore: number;
  totalRevenue: number;
  monthlyGrowth: number;
  trustScoreDistribution: {
    bronze: number;
    silver: number;
    gold: number;
    platinum: number;
  };
  propertyTypeDistribution: {
    residential: number;
    commercial: number;
    industrial: number;
  };
  priceRanges: {
    under100k: number;
    under200k: number;
    under300k: number;
    under500k: number;
    over500k: number;
  };
  monthlyStats: {
    month: string;
    properties: number;
    verifications: number;
    revenue: number;
  }[];
  topPerformingAgents: {
    agentId: string;
    agentName: string;
    properties: number;
    verifiedProperties: number;
    averageTrustScore: number;
  }[];
  marketInsights: {
    averagePrice: number;
    priceTrend: "up" | "down" | "stable";
    mostPopularType: string;
    mostVerifiedNeighborhood: string;
    verificationRate: number;
  };
}

export default function AdminDashboard() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(
    null,
  );
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState("30d");

  useEffect(() => {
    console.log("AdminDashboard: Component mounted");
    console.log("AdminDashboard: Firebase db object:", db);
    fetchAnalyticsData();
  }, [selectedTimeframe]);

  const fetchAnalyticsData = async () => {
    try {
      console.log("AdminDashboard: Starting to fetch data");
      setLoading(true);
      setError(null);

      // Test Firebase connection first
      console.log("AdminDashboard: Testing Firebase connection...");

      // Fetch properties
      console.log("AdminDashboard: Fetching properties from Firestore");
      const propertiesQuery = query(collection(db, "properties"));
      console.log("AdminDashboard: Query created:", propertiesQuery);

      const propertiesSnapshot = await getDocs(propertiesQuery);
      console.log(
        "AdminDashboard: Properties snapshot size:",
        propertiesSnapshot.size,
      );

      const propertiesData = propertiesSnapshot.docs.map((doc) => ({
        propertyId: doc.id,
        ...doc.data(),
      })) as Property[];

      console.log("AdminDashboard: Properties data:", propertiesData);
      setProperties(propertiesData);

      // Calculate analytics
      console.log("AdminDashboard: Calculating analytics");
      const analytics = calculateAnalytics(propertiesData);
      console.log("AdminDashboard: Analytics calculated:", analytics);
      setAnalyticsData(analytics);
    } catch (error) {
      console.error("AdminDashboard: Error fetching analytics data:", error);
      setError(
        error instanceof Error ? error.message : "Unknown error occurred",
      );
    } finally {
      console.log("AdminDashboard: Setting loading to false");
      setLoading(false);
    }
  };

  const calculateAnalytics = (properties: Property[]): AnalyticsData => {
    console.log(
      "AdminDashboard: Calculating analytics for",
      properties.length,
      "properties",
    );

    const totalProperties = properties.length;
    const verifiedProperties = properties.filter(
      (p) => p.verificationStatus?.overall === "verified",
    ).length;
    const pendingProperties = properties.filter(
      (p) => p.verificationStatus?.overall === "pending",
    ).length;
    const rejectedProperties = properties.filter(
      (p) => p.verificationStatus?.overall === "rejected",
    ).length;

    const totalRevenue = properties.reduce((sum, p) => sum + (p.price || 0), 0);
    const averageTrustScore =
      properties.reduce((sum, p) => sum + (p.trustScore || 0), 0) /
        totalProperties || 0;

    // Trust score distribution
    const trustScoreDistribution = {
      bronze: properties.filter((p) => p.trustBadge === "bronze").length,
      silver: properties.filter((p) => p.trustBadge === "silver").length,
      gold: properties.filter((p) => p.trustBadge === "gold").length,
      platinum: properties.filter((p) => p.trustBadge === "platinum").length,
    };

    // Property type distribution
    const propertyTypeDistribution = {
      residential: properties.filter((p) => p.propertyType === "residential")
        .length,
      commercial: properties.filter((p) => p.propertyType === "commercial")
        .length,
      industrial: properties.filter((p) => p.propertyType === "industrial")
        .length,
    };

    // Price ranges
    const priceRanges = {
      under100k: properties.filter((p) => (p.price || 0) < 100000).length,
      under200k: properties.filter(
        (p) => (p.price || 0) >= 100000 && (p.price || 0) < 200000,
      ).length,
      under300k: properties.filter(
        (p) => (p.price || 0) >= 200000 && (p.price || 0) < 300000,
      ).length,
      under500k: properties.filter(
        (p) => (p.price || 0) >= 300000 && (p.price || 0) < 500000,
      ).length,
      over500k: properties.filter((p) => (p.price || 0) >= 500000).length,
    };

    // Mock monthly stats (in real app, this would be calculated from actual data)
    const monthlyStats = [
      { month: "Jan", properties: 45, verifications: 38, revenue: 1250000 },
      { month: "Feb", properties: 52, verifications: 45, revenue: 1380000 },
      { month: "Mar", properties: 48, verifications: 42, revenue: 1320000 },
      { month: "Apr", properties: 61, verifications: 53, revenue: 1580000 },
      { month: "May", properties: 58, verifications: 49, revenue: 1520000 },
      { month: "Jun", properties: 67, verifications: 58, revenue: 1680000 },
    ];

    // Top performing agents
    const agentStats = properties.reduce(
      (acc, property) => {
        if (!acc[property.agentId]) {
          acc[property.agentId] = {
            agentId: property.agentId,
            agentName: property.agentName || "Unknown Agent",
            properties: 0,
            verifiedProperties: 0,
            totalTrustScore: 0,
          };
        }
        acc[property.agentId].properties++;
        if (property.verificationStatus?.overall === "verified") {
          acc[property.agentId].verifiedProperties++;
        }
        acc[property.agentId].totalTrustScore += property.trustScore || 0;
        return acc;
      },
      {} as Record<string, any>,
    );

    const topPerformingAgents = Object.values(agentStats)
      .map((agent) => ({
        ...agent,
        averageTrustScore: agent.totalTrustScore / agent.properties,
      }))
      .sort((a, b) => b.verifiedProperties - a.verifiedProperties)
      .slice(0, 5);

    // Market insights
    const averagePrice = totalRevenue / totalProperties || 0;
    const mostPopularType =
      Object.entries(propertyTypeDistribution).sort(
        ([, a], [, b]) => b - a,
      )[0]?.[0] || "residential";

    const neighborhoodStats = properties.reduce(
      (acc, p) => {
        const neighborhood = p.location?.neighborhood || "Unknown";
        acc[neighborhood] = (acc[neighborhood] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    const mostVerifiedNeighborhood =
      Object.entries(neighborhoodStats).sort(([, a], [, b]) => b - a)[0]?.[0] ||
      "Unknown";

    const marketInsights = {
      averagePrice,
      priceTrend: "up" as const,
      mostPopularType,
      mostVerifiedNeighborhood,
      verificationRate: (verifiedProperties / totalProperties) * 100,
    };

    return {
      totalProperties,
      totalAgents: Object.keys(agentStats).length,
      totalUsers: 1250, // Mock data
      totalDocuments: 3420, // Mock data
      verifiedProperties,
      pendingProperties,
      rejectedProperties,
      averageTrustScore,
      totalRevenue,
      monthlyGrowth: 12.5, // Mock data
      trustScoreDistribution,
      propertyTypeDistribution,
      priceRanges,
      monthlyStats,
      topPerformingAgents,
      marketInsights,
    };
  };

  const StatCard = ({
    title,
    value,
    icon: Icon,
    trend,
    trendValue,
    color = "blue",
  }: {
    title: string;
    value: string | number;
    icon: any;
    trend?: "up" | "down" | "stable";
    trendValue?: string;
    color?: string;
  }) => (
    <div
      className={`rounded-lg border-l-4 bg-white p-6 shadow-md dark:bg-gray-800 border-${color}-500`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {title}
          </p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {value}
          </p>
          {trend && trendValue && (
            <div className="mt-2 flex items-center">
              {trend === "up" ? (
                <FiTrendingUp className="h-4 w-4 text-green-500" />
              ) : trend === "down" ? (
                <FiTrendingDown className="h-4 w-4 text-red-500" />
              ) : (
                <FiBarChart2 className="h-4 w-4 text-gray-500" />
              )}
              <span
                className={`ml-1 text-sm ${
                  trend === "up"
                    ? "text-green-600"
                    : trend === "down"
                      ? "text-red-600"
                      : "text-gray-600"
                }`}
              >
                {trendValue}
              </span>
            </div>
          )}
        </div>
        <Icon className={`h-8 w-8 text-${color}-500`} />
      </div>
    </div>
  );

  const ChartCard = ({
    title,
    children,
  }: {
    title: string;
    children: React.ReactNode;
  }) => (
    <div className="rounded-lg bg-white p-6 shadow-md dark:bg-gray-800">
      <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
        {title}
      </h3>
      {children}
    </div>
  );

  console.log(
    "AdminDashboard: Rendering with loading:",
    loading,
    "error:",
    error,
    "analyticsData:",
    analyticsData,
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <AdminHeader />
        <div className="flex h-64 items-center justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <AdminHeader />
        <div className="flex h-64 items-center justify-center">
          <div className="text-center">
            <p className="mb-4 text-red-500 dark:text-red-400">
              Error loading analytics data
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{error}</p>
            <button
              onClick={fetchAnalyticsData}
              className="mt-4 rounded-lg bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <AdminHeader />
        <div className="flex h-64 items-center justify-center">
          <p className="text-gray-500 dark:text-gray-400">
            No analytics data available
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <AdminHeader />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Property Analytics Dashboard
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Comprehensive insights into property verification platform
            performance
          </p>
        </div>

        {/* Timeframe Selector */}
        <div className="mb-6">
          <div className="flex space-x-2">
            {["7d", "30d", "90d", "1y"].map((timeframe) => (
              <button
                key={timeframe}
                onClick={() => setSelectedTimeframe(timeframe)}
                className={`rounded-lg px-4 py-2 text-sm font-medium ${
                  selectedTimeframe === timeframe
                    ? "bg-blue-500 text-white"
                    : "bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                }`}
              >
                {timeframe}
              </button>
            ))}
          </div>
        </div>

        {/* Key Metrics */}
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Properties"
            value={analyticsData.totalProperties}
            icon={FiHome}
            trend="up"
            trendValue="+12.5%"
            color="blue"
          />
          <StatCard
            title="Verified Properties"
            value={analyticsData.verifiedProperties}
            icon={FiCheckCircle}
            trend="up"
            trendValue="+8.3%"
            color="green"
          />
          <StatCard
            title="Total Revenue"
            value={`RM${(analyticsData.totalRevenue / 1000000).toFixed(1)}M`}
            icon={FiDollarSign}
            trend="up"
            trendValue="+15.2%"
            color="yellow"
          />
          <StatCard
            title="Avg Trust Score"
            value={`${analyticsData.averageTrustScore.toFixed(1)}%`}
            icon={FiShield}
            trend="up"
            trendValue="+5.7%"
            color="purple"
          />
        </div>

        {/* Charts and Insights */}
        <div className="mb-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Trust Score Distribution */}
          <ChartCard title="Trust Score Distribution">
            <div className="space-y-4">
              {Object.entries(analyticsData.trustScoreDistribution).map(
                ([badge, count]) => (
                  <div
                    key={badge}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center">
                      <div
                        className={`mr-3 h-4 w-4 rounded-full ${
                          badge === "bronze"
                            ? "bg-yellow-500"
                            : badge === "silver"
                              ? "bg-gray-400"
                              : badge === "gold"
                                ? "bg-yellow-400"
                                : "bg-purple-500"
                        }`}
                      />
                      <span className="text-gray-700 capitalize dark:text-gray-300">
                        {badge}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <div className="mr-3 h-2 w-32 rounded-full bg-gray-200">
                        <div
                          className="h-2 rounded-full bg-blue-500"
                          style={{
                            width: `${(count / analyticsData.totalProperties) * 100}%`,
                          }}
                        />
                      </div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {count}
                      </span>
                    </div>
                  </div>
                ),
              )}
            </div>
          </ChartCard>

          {/* Property Type Distribution */}
          <ChartCard title="Property Type Distribution">
            <div className="space-y-4">
              {Object.entries(analyticsData.propertyTypeDistribution).map(
                ([type, count]) => (
                  <div key={type} className="flex items-center justify-between">
                    <span className="text-gray-700 capitalize dark:text-gray-300">
                      {type}
                    </span>
                    <div className="flex items-center">
                      <div className="mr-3 h-2 w-32 rounded-full bg-gray-200">
                        <div
                          className="h-2 rounded-full bg-green-500"
                          style={{
                            width: `${(count / analyticsData.totalProperties) * 100}%`,
                          }}
                        />
                      </div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {count}
                      </span>
                    </div>
                  </div>
                ),
              )}
            </div>
          </ChartCard>
        </div>

        {/* Market Insights */}
        <div className="mb-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
          <ChartCard title="Market Insights">
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">
                  Average Price
                </span>
                <span className="font-semibold">
                  RM{analyticsData.marketInsights.averagePrice.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">
                  Most Popular Type
                </span>
                <span className="font-semibold capitalize">
                  {analyticsData.marketInsights.mostPopularType}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">
                  Verification Rate
                </span>
                <span className="font-semibold">
                  {analyticsData.marketInsights.verificationRate.toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">
                  Top Neighborhood
                </span>
                <span className="font-semibold">
                  {analyticsData.marketInsights.mostVerifiedNeighborhood}
                </span>
              </div>
            </div>
          </ChartCard>

          <ChartCard title="Price Distribution">
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>Under RM100k</span>
                <span>{analyticsData.priceRanges.under100k}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>RM100k - RM200k</span>
                <span>{analyticsData.priceRanges.under200k}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>RM200k - RM300k</span>
                <span>{analyticsData.priceRanges.under300k}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>RM300k - RM500k</span>
                <span>{analyticsData.priceRanges.under500k}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Over RM500k</span>
                <span>{analyticsData.priceRanges.over500k}</span>
              </div>
            </div>
          </ChartCard>

          <ChartCard title="Monthly Performance">
            <div className="space-y-3">
              {analyticsData.monthlyStats.slice(-3).map((stat, index) => (
                <div key={stat.month} className="flex justify-between text-sm">
                  <span>{stat.month}</span>
                  <span>{stat.properties} properties</span>
                </div>
              ))}
            </div>
          </ChartCard>
        </div>

        {/* Top Performing Agents */}
        <ChartCard title="Top Performing Agents">
          <div className="space-y-4">
            {analyticsData.topPerformingAgents.map((agent, index) => (
              <div
                key={agent.agentId || `agent-${index}`}
                className="flex items-center justify-between rounded-lg bg-gray-50 p-3 dark:bg-gray-700"
              >
                <div className="flex items-center">
                  <div className="mr-3 flex h-8 w-8 items-center justify-center rounded-full bg-blue-500 text-sm font-bold text-white">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {agent.agentName}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {agent.properties} properties • {agent.verifiedProperties}{" "}
                      verified
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {agent.averageTrustScore.toFixed(1)}%
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Avg Trust Score
                  </p>
                </div>
              </div>
            ))}
          </div>
        </ChartCard>
      </div>
    </div>
  );
}
