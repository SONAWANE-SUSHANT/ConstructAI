import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import ProtectedRoute from "./ProtectedRoute";
import Skeleton from "../components/Skeleton";

const Login = lazy(() => import("../pages/auth/Login"));
const Register = lazy(() => import("../pages/auth/Register"));
const Profile = lazy(() => import("../pages/auth/Profile"));
const Dashboard = lazy(() => import("../pages/dashboard/Dashboard"));
const Projects = lazy(() => import("../pages/projects/Projects"));
const CreateProject = lazy(() => import("../pages/projects/CreateProject"));
const ProjectDetails = lazy(() => import("../pages/projects/ProjectDetails"));
const Reports = lazy(() => import("../pages/reports/Reports"));
const Materials = lazy(() => import("../pages/resources/Materials"));
const Workers = lazy(() => import("../pages/resources/Workers"));
const Equipment = lazy(() => import("../pages/resources/Equipment"));
const Settings = lazy(() => import("../pages/settings/Settings"));
const Forbidden = lazy(() => import("../pages/system/Forbidden"));
const NotFound = lazy(() => import("../pages/system/NotFound"));

const RouteFallback = () => (
    <main className="min-h-screen bg-slate-50 px-4 py-8 dark:bg-slate-950">
        <section className="mx-auto w-full max-w-6xl space-y-4">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-72 w-full" />
        </section>
    </main>
);

export default function AppRoutes() {
    return (
        <BrowserRouter>
            <Suspense fallback={<RouteFallback />}>
                <Routes>
                    <Route path="/" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route element={<ProtectedRoute />}>
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/profile" element={<Profile />} />
                        <Route path="/projects" element={<Projects />} />
                        <Route path="/projects/new" element={<CreateProject />} />
                        <Route path="/projects/:id" element={<ProjectDetails />} />
                        <Route path="/projects/:id/edit" element={<CreateProject />} />
                        <Route path="/reports" element={<Reports />} />
                        <Route path="/resources/materials" element={<Materials />} />
                        <Route path="/resources/workers" element={<Workers />} />
                        <Route path="/resources/equipment" element={<Equipment />} />
                        <Route path="/settings" element={<Settings />} />
                        <Route path="/403" element={<Forbidden />} />
                    </Route>
                    <Route path="*" element={<NotFound />} />
                </Routes>
            </Suspense>
        </BrowserRouter>
    );
}
