import { Blog } from "@/types/blog";

const blogData: Blog[] = [
  {
    id: 1,
    title: "How to Choose the Right Property",
    paragraph:
      "Discover the essential UI components that can elevate your property platform, improve user experience, and boost engagement for buyers and agents alike.",
    image: "/images/property/property-ex-1.png",
    author: {
      name: "Samuyl Joshi",
      image: "/images/blog/author-01.png",
      designation: "Graphic Designer",
    },
    tags: ["creative"],
    publishDate: "2025",
  },
  {
    id: 2,
    title: "Top Features Buyers Want in 2024",
    paragraph:
      "Level up your real estate website with these practical design tips—perfect for agents, developers, and anyone looking to create a more attractive, effective platform.",
    image: "/images/property/property-ex-2.png",
    author: {
      name: "Musharof Chy",
      image: "/images/blog/author-02.png",
      designation: "Content Writer",
    },
    tags: ["computer"],
    publishDate: "2025",
  },
  {
    id: 3,
    title: "The Future of Smart Homes in Malaysia",
    paragraph:
      "Explore proven strategies and tools to help you code faster and smarter—whether you're building property apps, dashboards, or automation tools.",
    image: "/images/property/property-ex-3.png",
    author: {
      name: "Lethium Deo",
      image: "/images/blog/author-03.png",
      designation: "Graphic Designer",
    },
    tags: ["design"],
    publishDate: "2025",
  },
];
export default blogData;
