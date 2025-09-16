import { LucideIcon } from "lucide-react";

type InfoCardProps = {
  title: string;
  value: number | string;
  subtitle?: string;
  icon: LucideIcon;
};

export default function InfoCard({ title, value, subtitle, icon: Icon }: InfoCardProps) {
  return (
    <div
      className="rounded-2xl border border-green-200 bg-green-50 p-5 
      shadow-sm flex flex-col justify-between relative w-75 
      transition transform hover:-translate-y-1 hover:shadow-md
      "
    >

      <Icon className="absolute top-4 right-4 h-5 w-5 text-green-500" />

      <p className="text-sm text-gray-700 font-medium">{title}</p>

      <h2 className="text-3xl font-bold text-green-600 mt-2">{value}</h2>

      {subtitle && (
        <span className="text-sm text-gray-500 mt-1">{subtitle}</span>
      )}
      
    </div>
  );
}
