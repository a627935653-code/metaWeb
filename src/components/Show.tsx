import React from "react";

export const Show: React.FC<{
  children: React.ReactNode;
  when?: boolean;
  fallback?: React.ReactNode;
}> = ({ when, fallback = null, children }) => {
  return when ? children : fallback;
};
