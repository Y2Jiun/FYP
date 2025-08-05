"use client";
import React, { useState, useEffect } from "react";
import UserHeader from "@/components/User/userHeader";
import { db, auth } from "@/lib/firebase";
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import Link from "next/link";
import {
  FiTrendingUp,
  FiTrendingDown,
  FiHome,
  FiSearch,
  FiHeart,
  FiEye,
  FiMessageSquare,
  FiBarChart2,
  FiPieChart,
  FiMapPin,
  FiClock,
  FiCheckCircle,
  FiAlertCircle,
  FiXCircle,
  FiStar,
  FiDollarSign,
  FiShield,
  FiUsers,
  FiBookmark,
  FiActivity,
} from "react-icons/fi";

interface Property {
  id: string;
  title: string;
  address: string;
  price: number;
  type: string;
  status: "pending" | "verified" | "rejected";
  image1?: string;
  agentUID?: string;
  agentId?: string;
  trustScore?: number;
  trustBadge?: string;
  createdAt: any;
  updatedAt: any;
}

interface UserAnalyticsData {
  totalPropertiesViewed: number;
  savedProperties: number;
  propertiesInCart: number;
  totalSearches: number;
  averageTrustScore: number;
  totalNotifications: number;
  unreadNotifications: number;
  monthlyGrowth: number;
  trustScoreDistribution: {
    bronze: number;
    silver: number;
    gold: number;
    platinum: number;
  };
  propertyTypePreferences: {
    residential: number;
    commercial: number;
    industrial: number;
  };
  priceRangePreferences: {
    under100k: number;
    under200k: number;
    under300k: number;
    under500k: number;
    over500k: number;
  };
  monthlyStats: {
    month: string;
    searches: number;
    views: number;
    saves: number;
  }[];
  topViewedProperties: {
    propertyId: string;
    title: string;
    price: number;
    trustScore: number;
    status: string;
    viewCount: number;
  }[];
  searchInsights: {
    averagePrice: number;
    mostSearchedType: string;
    averageTrustScore: number;
    searchFrequency: number;
  };
}

export default function UserDashboard() {
  const [analyticsData, setAnalyticsData] = useState<UserAnalyticsData | null>(
    null,
  );
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState("30d");
  const [userId, setUserId] = useState<string | null>(null);

  // Set userId from Firebase auth
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
      } else {
        setUserId(null);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!userId) return;
    fetchAnalyticsData(userId);
  }, [userId, selectedTimeframe]);

  const fetchAnalyticsData = async (userID: string) => {
    try {
      setLoading(true);
      setError(null);

      // Fetch user's viewed properties (mock data for now)
      const propertiesQuery = query(
        collection(db, "properties"),
        where("status", "==", "verified"),
      );
      const propertiesSnapshot = await getDocs(propertiesQuery);
      const propertiesData = propertiesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Property[];

      // Simulate user-specific data
      const userProperties = propertiesData.slice(
        0,
        Math.floor(Math.random() * 10) + 5,
      );
      setProperties(userProperties);

      // Fetch user's saved properties
      console.log("Fetching saved properties for userID:", userID);
      const savedPropertiesQuery = query(
        collection(db, "savedProperties"),
        where("userId", "==", userID),
      );
      const savedPropertiesSnapshot = await getDocs(savedPropertiesQuery);
      const savedPropertiesCount = savedPropertiesSnapshot.size;
      console.log("Found saved properties count:", savedPropertiesCount);
      console.log("Saved properties docs:", savedPropertiesSnapshot.docs.map(doc => doc.data()));

      // Fetch user's notifications
      const notificationsQuery = query(
        collection(db, "notification"),
        where("userID", "==", userID),
      );
      const notificationsSnapshot = await getDocs(notificationsQuery);
      const totalNotifications = notificationsSnapshot.size;
      const unreadNotifications = notificationsSnapshot.docs.filter(
        (doc) => !doc.data().readBy?.[userID],
      ).length;

      // Calculate analytics
      const analytics = calculateUserAnalytics(
        userProperties,
        totalNotifications,
        unreadNotifications,
        savedPropertiesCount,
      );
      setAnalyticsData(analytics);
    } catch (error) {
      console.error("Error fetching user analytics data:", error);
      setError(
        error instanceof Error ? error.message : "Unknown error occurred",
      );
    } finally {
      setLoading(false);
    }
  };

  const calculateUserAnalytics = (
    properties: Property[],
    totalNotifications: number,
    unreadNotifications: number,
    savedPropertiesCount: number,
  ): UserAnalyticsData => {
    const totalPropertiesViewed = properties.length;
    const savedProperties = savedPropertiesCount; // Real saved properties count
    const propertiesInCart = Math.floor(properties.length * 0.2); // Mock data
    const totalSearches = Math.floor(properties.length * 2.5); // Mock data
    const averageTrustScore =
      properties.reduce((sum, p) => sum + (p.trustScore || 0), 0) /
        totalPropertiesViewed || 0;

    // Trust score distribution of viewed properties
    const trustScoreDistribution = {
      bronze: properties.filter((p) => p.trustBadge === "bronze").length,
      silver: properties.filter((p) => p.trustBadge === "silver").length,
      gold: properties.filter((p) => p.trustBadge === "gold").length,
      platinum: properties.filter((p) => p.trustBadge === "platinum").length,
    };

    // Property type preferences
    const propertyTypePreferences = {
      residential: properties.filter((p) => p.type === "residential").length,
      commercial: properties.filter((p) => p.type === "commercial").length,
      industrial: properties.filter((p) => p.type === "industrial").length,
    };

    // Price range preferences
    const priceRangePreferences = {
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

    // Mock monthly stats
    const monthlyStats = [
      { month: "Jan", searches: 15, views: 8, saves: 3 },
      { month: "Feb", searches: 18, views: 12, saves: 5 },
      { month: "Mar", searches: 22, views: 15, saves: 7 },
      { month: "Apr", searches: 25, views: 18, saves: 9 },
      { month: "May", searches: 28, views: 20, saves: 11 },
      { month: "Jun", searches: 30, views: 22, saves: 13 },
    ];

    // Top viewed properties
    const topViewedProperties = properties
      .sort((a, b) => (b.trustScore || 0) - (a.trustScore || 0))
      .slice(0, 5)
      .map((p, index) => ({
        propertyId: p.id,
        title: p.title,
        price: p.price,
        trustScore: p.trustScore || 0,
        status: p.status,
        viewCount: Math.floor(Math.random() * 20) + 5, // Mock view count
      }));

    // Search insights
    const averagePrice =
      properties.reduce((sum, p) => sum + (p.price || 0), 0) /
        totalPropertiesViewed || 0;
    const mostSearchedType =
      Object.entries(propertyTypePreferences).sort(
        ([, a], [, b]) => b - a,
      )[0]?.[0] || "residential";

    const searchInsights = {
      averagePrice,
      mostSearchedType,
      averageTrustScore,
      searchFrequency: Math.floor(totalSearches / 6), // Average searches per month
    };

    return {
      totalPropertiesViewed,
      savedProperties,
      propertiesInCart,
      totalSearches,
      averageTrustScore,
      totalNotifications,
      unreadNotifications,
      monthlyGrowth: 12.5, // Mock data
      trustScoreDistribution,
      propertyTypePreferences,
      priceRangePreferences,
      monthlyStats,
      topViewedProperties,
      searchInsights,
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <UserHeader />
        <div className="flex h-64 items-center justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <UserHeader />
        <div className="flex h-64 items-center justify-center">
          <div className="text-center">
            <p className="mb-4 text-red-500 dark:text-red-400">
              Error loading analytics data
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{error}</p>
            <button
              onClick={() => userId && fetchAnalyticsData(userId)}
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
        <UserHeader />
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
      <UserHeader />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            User Analytics Dashboard
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Your property search activity and platform engagement insights
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
            title="Properties Viewed"
            value={analyticsData.totalPropertiesViewed}
            icon={FiEye}
            trend="up"
            trendValue="+15.2%"
            color="blue"
          />
          <StatCard
            title="Saved Properties"
            value={analyticsData.savedProperties}
            icon={FiHeart}
            trend="up"
            trendValue="+8.3%"
            color="red"
          />
          <StatCard
            title="Total Searches"
            value={analyticsData.totalSearches}
            icon={FiSearch}
            trend="up"
            trendValue="+12.5%"
            color="green"
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

        {/* Additional Metrics */}
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
          <StatCard
            title="Properties in Cart"
            value={analyticsData.propertiesInCart}
            icon={FiBookmark}
            trend="up"
            trendValue="+3.2%"
            color="indigo"
          />
          <StatCard
            title="Unread Notifications"
            value={analyticsData.unreadNotifications}
            icon={FiMessageSquare}
            trend="down"
            trendValue="-7.8%"
            color="orange"
          />
          <StatCard
            title="Search Frequency"
            value={`${analyticsData.searchInsights.searchFrequency}/month`}
            icon={FiActivity}
            trend="up"
            trendValue="+9.1%"
            color="pink"
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
                            width: `${(count / analyticsData.totalPropertiesViewed) * 100}%`,
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

          {/* Property Type Preferences */}
          <ChartCard title="Property Type Preferences">
            <div className="space-y-4">
              {Object.entries(analyticsData.propertyTypePreferences).map(
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
                            width: `${(count / analyticsData.totalPropertiesViewed) * 100}%`,
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

        {/* Search Insights */}
        <div className="mb-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
          <ChartCard title="Search Insights">
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">
                  Average Price
                </span>
                <span className="font-semibold">
                  RM{analyticsData.searchInsights.averagePrice.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">
                  Most Searched Type
                </span>
                <span className="font-semibold capitalize">
                  {analyticsData.searchInsights.mostSearchedType}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">
                  Avg Trust Score
                </span>
                <span className="font-semibold">
                  {analyticsData.searchInsights.averageTrustScore.toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">
                  Search Frequency
                </span>
                <span className="font-semibold">
                  {analyticsData.searchInsights.searchFrequency}/month
                </span>
              </div>
            </div>
          </ChartCard>

          <ChartCard title="Price Range Preferences">
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>Under RM100k</span>
                <span>{analyticsData.priceRangePreferences.under100k}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>RM100k - RM200k</span>
                <span>{analyticsData.priceRangePreferences.under200k}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>RM200k - RM300k</span>
                <span>{analyticsData.priceRangePreferences.under300k}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>RM300k - RM500k</span>
                <span>{analyticsData.priceRangePreferences.under500k}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Over RM500k</span>
                <span>{analyticsData.priceRangePreferences.over500k}</span>
              </div>
            </div>
          </ChartCard>

          <ChartCard title="Monthly Activity">
            <div className="space-y-3">
              {analyticsData.monthlyStats.slice(-3).map((stat, index) => (
                <div key={stat.month} className="flex justify-between text-sm">
                  <span>{stat.month}</span>
                  <span>{stat.searches} searches</span>
                </div>
              ))}
            </div>
          </ChartCard>
        </div>

        {/* Top Viewed Properties */}
        <ChartCard title="Top Viewed Properties">
          <div className="space-y-4">
            {analyticsData.topViewedProperties.map((property, index) => (
              <div
                key={property.propertyId}
                className="flex items-center justify-between rounded-lg bg-gray-50 p-3 dark:bg-gray-700"
              >
                <div className="flex items-center">
                  <div className="mr-3 flex h-8 w-8 items-center justify-center rounded-full bg-blue-500 text-sm font-bold text-white">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {property.title}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      RM{property.price.toLocaleString()} • {property.viewCount}{" "}
                      views
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {property.trustScore.toFixed(1)}%
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Trust Score
                  </p>
                </div>
              </div>
            ))}
          </div>
        </ChartCard>

        {/* Quick Actions */}
        <div className="mt-8 rounded-lg bg-white p-6 shadow-md dark:bg-gray-800">
          <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
            Quick Actions
          </h2>
          <div className="flex flex-wrap gap-4">
            <Link
              href="/user/userPropertyList"
              className="rounded bg-blue-600 px-4 py-2 text-white transition hover:bg-blue-700"
            >
              Browse Properties
            </Link>
            <Link
              href="/user/savedProperties"
              className="rounded bg-red-600 px-4 py-2 text-white transition hover:bg-red-700"
            >
              Saved Properties
            </Link>
            <Link
              href="/user/userNotification"
              className="rounded bg-purple-600 px-4 py-2 text-white transition hover:bg-purple-700"
            >
              View Notifications
            </Link>
            <Link
              href="/user/userprofile"
              className="rounded bg-gray-600 px-4 py-2 text-white transition hover:bg-gray-700"
            >
              My Profile
            </Link>
            <Link
              href="/user/userCalculator"
              className="rounded bg-green-600 px-4 py-2 text-white transition hover:bg-green-700"
            >
              ROI Calculator
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
