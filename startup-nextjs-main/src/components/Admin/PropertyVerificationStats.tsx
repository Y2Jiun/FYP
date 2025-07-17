"use client";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { PropertyVerificationStats } from "@/types/property";
import {
  FiTrendingUp,
  FiTrendingDown,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiFileText,
  FiImage,
} from "react-icons/fi";

interface Props {
  className?: string;
}

export default function PropertyVerificationStats({ className = "" }: Props) {
  const [stats, setStats] = useState<PropertyVerificationStats>({
    totalProperties: 0,
    pendingVerification: 0,
    verifiedProperties: 0,
    rejectedProperties: 0,
    totalDocuments: 0,
    pendingDocuments: 0,
    verifiedDocuments: 0,
    rejectedDocuments: 0,
    averageVerificationTime: 0,
    verificationSuccessRate: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      // Fetch properties stats
      const propertiesSnapshot = await getDocs(collection(db, "properties"));
      const properties = propertiesSnapshot.docs.map((doc) => doc.data());

      // Fetch documents stats
      const documentsSnapshot = await getDocs(
        collection(db, "propertyDocuments"),
      );
      const documents = documentsSnapshot.docs.map((doc) => doc.data());

      // Calculate stats
      const totalProperties = properties.length;
      const pendingVerification = properties.filter(
        (p: any) => p.status === "pending_verification",
      ).length;
      const verifiedProperties = properties.filter(
        (p: any) => p.status === "verified",
      ).length;
      const rejectedProperties = properties.filter(
        (p: any) => p.status === "rejected",
      ).length;

      const totalDocuments = documents.length;
      const pendingDocuments = documents.filter(
        (d: any) => d.verificationStatus === "pending",
      ).length;
      const verifiedDocuments = documents.filter(
        (d: any) => d.verificationStatus === "verified",
      ).length;
      const rejectedDocuments = documents.filter(
        (d: any) => d.verificationStatus === "rejected",
      ).length;

      const verificationSuccessRate =
        totalProperties > 0 ? (verifiedProperties / totalProperties) * 100 : 0;

      setStats({
        totalProperties,
        pendingVerification,
        verifiedProperties,
        rejectedProperties,
        totalDocuments,
        pendingDocuments,
        verifiedDocuments,
        rejectedDocuments,
        averageVerificationTime: 24, // Mock data - would calculate from actual verification times
        verificationSuccessRate,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: "Total Properties",
      value: stats.totalProperties,
      icon: <FiFileText className="text-blue-500" />,
      color: "bg-blue-500/10 border-blue-500/20",
      textColor: "text-blue-400",
    },
    {
      title: "Pending Verification",
      value: stats.pendingVerification,
      icon: <FiClock className="text-yellow-500" />,
      color: "bg-yellow-500/10 border-yellow-500/20",
      textColor: "text-yellow-400",
    },
    {
      title: "Verified Properties",
      value: stats.verifiedProperties,
      icon: <FiCheckCircle className="text-green-500" />,
      color: "bg-green-500/10 border-green-500/20",
      textColor: "text-green-400",
    },
    {
      title: "Rejected Properties",
      value: stats.rejectedProperties,
      icon: <FiXCircle className="text-red-500" />,
      color: "bg-red-500/10 border-red-500/20",
      textColor: "text-red-400",
    },
    {
      title: "Total Documents",
      value: stats.totalDocuments,
      icon: <FiFileText className="text-purple-500" />,
      color: "bg-purple-500/10 border-purple-500/20",
      textColor: "text-purple-400",
    },
    {
      title: "Success Rate",
      value: `${stats.verificationSuccessRate.toFixed(1)}%`,
      icon: <FiTrendingUp className="text-emerald-500" />,
      color: "bg-emerald-500/10 border-emerald-500/20",
      textColor: "text-emerald-400",
    },
  ];

  if (loading) {
    return (
      <div
        className={`grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 ${className}`}
      >
        {[...Array(6)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="h-32 rounded-xl border border-gray-700 bg-gray-800"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div
      className={`grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 ${className}`}
    >
      {statCards.map((stat, index) => (
        <div
          key={index}
          className={`rounded-xl border p-6 transition-all hover:shadow-lg ${stat.color}`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">{stat.title}</p>
              <p className={`mt-2 text-3xl font-bold ${stat.textColor}`}>
                {stat.value}
              </p>
            </div>
            <div className="text-3xl">{stat.icon}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
