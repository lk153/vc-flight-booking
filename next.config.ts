import type { NextConfig } from "next";
import dns from "node:dns";

// Node.js 22 defaults to "verbatim" DNS order which may try IPv6 first.
// Force IPv4-first to avoid timeouts on networks without IPv6 connectivity.
dns.setDefaultResultOrder("ipv4first");

const nextConfig: NextConfig = {};

export default nextConfig;
