"use client";

import { Home, KeyRound } from "lucide-react";

import { cn } from "@/lib/utils";

type RoleOption = "BUYER" | "SELLER";

type RoleSelectorProps = {
  value: RoleOption;
  onChange: (role: RoleOption) => void;
};

const options = [
  {
    value: "BUYER" as const,
    title: "I'm a Buyer",
    description: "Browse properties",
    icon: Home,
  },
  {
    value: "SELLER" as const,
    title: "I'm a Seller",
    description: "List properties",
    icon: KeyRound,
  },
];

export function RoleSelector({ value, onChange }: RoleSelectorProps) {
  return (
    <div className="grid w-full grid-cols-2 gap-3">
      {options.map((option) => {
        const Icon = option.icon;
        const isSelected = value === option.value;

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={cn(
              "flex w-full flex-col items-start rounded-xl border p-4 text-left transition-all",
              isSelected
                ? "ring-2 ring-primary bg-primary/5 text-primary border-primary"
                : "border-gray-200 bg-white text-gray-700 hover:border-gray-300",
            )}
          >
            <Icon className="mb-3 h-6 w-6" />
            <span className="font-semibold">{option.title}</span>
            <span className="mt-1 text-sm text-muted-foreground">
              {option.description}
            </span>
          </button>
        );
      })}
    </div>
  );
}
