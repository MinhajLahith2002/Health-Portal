"use client";
import { useCallback,useEffect,useMemo,useState } from "react";
import { appointmentService } from "@/services/appointmentService";
import type { Appointment,AppointmentFilters } from "@/types/appointment";
export function useAppointments(initialFilters:AppointmentFilters={},autoLoad=true){
  const[appointments,setAppointments]=useState<Appointment[]>([]);const[loading,setLoading]=useState(autoLoad);const[error,setError]=useState("");const[filters,setFilters]=useState(initialFilters);
  const loadAppointments=useCallback(async(next:AppointmentFilters)=>{try{setLoading(true);setError("");setAppointments(await appointmentService.getAppointments(next));}catch(e){setError(e instanceof Error?e.message:"Unable to load appointments.");}finally{setLoading(false);}},[]);
  useEffect(()=>{if(!autoLoad)return;const timer=window.setTimeout(()=>void loadAppointments(filters),0);return()=>window.clearTimeout(timer);},[autoLoad,filters,loadAppointments]);
  const summary=useMemo(()=>({upcoming:appointments.filter(a=>a.status==="BOOKED"||a.status==="UPCOMING").length,completed:appointments.filter(a=>a.status==="COMPLETED"||a.status==="NO_SHOW").length,cancelled:appointments.filter(a=>a.status==="CANCELLED").length}),[appointments]);
  const cancelAppointment=async(appointmentId:string,reason?:string)=>{const result=await appointmentService.cancelAppointment({appointmentId,reason});await loadAppointments(filters);return result;};
  return{appointments,summary,loading,error,filters,setFilters,reload:()=>loadAppointments(filters),cancelAppointment};
}
