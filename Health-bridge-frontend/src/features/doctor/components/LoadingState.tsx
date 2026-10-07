import { LoaderCircle } from "lucide-react";
export default function LoadingState() { return <div className="flex min-h-56 items-center justify-center"><LoaderCircle className="h-7 w-7 animate-spin text-blue-600" /><span className="ml-3 text-sm text-slate-500">Loading doctor workspace...</span></div>; }
