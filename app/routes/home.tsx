import { env } from "cloudflare:workers";

import { eq } from "drizzle-orm";
import { ExternalLink, Plus, Trash2 } from "lucide-react";
import { Form, useNavigation } from "react-router";
import { getDb } from "../server/db/index";
import { projectLogs } from "../server/db/schema";
import type { Route } from "./+types/home";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Project Logger" },
    { name: "description", content: "Links to some of my projects" },
  ];
}

export async function loader() {
  const db = getDb(env);
  const logs = await db.select().from(projectLogs);
  return { logs };
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const db = getDb(env);
  if (request?.method === "DELETE") {
    const idString = formData.get("id") as string;
    const id = parseInt(idString, 10);
    if (id && id > 0) {
      await db.delete(projectLogs).where(eq(projectLogs.id, id));
      return { success: true };
    }
    return { success: false };
  }
  if (request?.method === "POST") {
    const name = formData.get("name") as string;
    const url = formData.get("url") as string;
    await db.insert(projectLogs).values({ name, url });
    return { success: true };
  }
  return { success: false };
}
export default function Home({ loaderData }: Route.ComponentProps) {
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting" && navigation.formMethod === "POST";
  const deleteIdString = navigation.formData?.get("id") as unknown as string;
  const deleteIdInt = parseInt(deleteIdString, 10);
  const isDeleting = navigation.state === "submitting" && navigation.formMethod === "DELETE";

  return (
    <div className="min-h-screen bg-linear-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center ">
      <div className="bg-white/80 backdrop-blur-sm w-full max-w-lg px-6 sm:p-6 transition-all duration-300">
        {/* Header with Icon */}
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-linear-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg shadow-blue-200">
            <Plus className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold bg-linear-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              Add New Project
            </h1>
            <p className="text-xs text-gray-400 mt-0.5 hidden sm:block">
              Track your projects effortlessly
            </p>
          </div>
        </div>

        {/* Form */}
        <Form name="add_project" method="post" className="flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="group relative flex-1">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">
                Project Name
              </label>
              <input
                type="text"
                name="name"
                placeholder="e.g., My Awesome Project"
                required
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 outline-none transition-all duration-200 focus:border-blue-400 focus:ring-4 focus:ring-blue-100 bg-gray-50/50 hover:bg-white placeholder:text-gray-400"
              />
            </div>

            <div className="group relative flex-1">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">
                Project URL
              </label>
              <input
                type="url"
                name="url"
                placeholder="https://example.com"
                required
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 outline-none transition-all duration-200 focus:border-blue-400 focus:ring-4 focus:ring-blue-100 bg-gray-50/50 hover:bg-white placeholder:text-gray-400"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-1 relative overflow-hidden rounded-lg bg-linear-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white text-sm font-semibold py-2.5 px-6 transition-all duration-300 shadow-lg shadow-blue-200 hover:shadow-xl hover:shadow-blue-300 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <span className="animate-spin inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
                Adding...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                Add Project
              </>
            )}
          </button>
        </Form>

        {/* Projects List */}
        {loaderData.logs.length > 0 && (
          <div className="mt-5 pt-4 border-t border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-gray-600">Your Projects</h2>
              <span className="text-xs bg-gray-100 text-gray-500 px-2.5 py-0.5 rounded-full">
                {loaderData.logs.length}
              </span>
            </div>

            <div className="space-y-2 max-h-100 overflow-y-auto pr-1 custom-scrollbar">
              {loaderData.logs.map((log) => (
                <div
                  key={log.id}
                  className="group relative bg-linear-to-r from-gray-50 to-white rounded-xl border border-gray-200 p-3 transition-all duration-200 hover:shadow-md hover:border-blue-200 hover:-translate-y-0.5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate">{log.name}</p>
                      <a
                        href={log.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-blue-500 hover:text-blue-700 hover:underline transition-colors break-all mt-0.5"
                      >
                        {log.url.length > 40 ? `${log.url.substring(0, 40)}...` : log.url}
                        <ExternalLink className="w-3 h-3 shrink-0" />
                      </a>
                    </div>
                    <Form method="delete">
                      <input type="hidden" name="id" value={log.id} />
                      <button
                        disabled={deleteIdInt === log.id && isDeleting}
                        type="submit"
                        className="p-1.5 rounded-lg shrink-0"
                      >
                        <Trash2
                          className={`w-4 h-4 ${deleteIdInt === log.id && isDeleting ? "text-gray-500" : "text-red-500"}
                          `}
                        />
                      </button>
                    </Form>
                  </div>

                  {/* Decorative linear bar */}
                  <div className="absolute top-0 left-0 w-1 h-full bg-linear-to-b from-blue-400 to-purple-400 rounded-l-xl" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {loaderData.logs.length === 0 && (
          <div className="mt-5 pt-4 border-t border-gray-100 text-center py-6">
            <div className="w-14 h-14 bg-linear-to-br from-gray-50 to-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-2">
              <Plus className="w-5 h-5 text-gray-300" />
            </div>
            <p className="text-sm text-gray-400 font-medium">No projects yet</p>
            <p className="text-xs text-gray-300 mt-1">Add your first project above</p>
          </div>
        )}
      </div>

      {/* Custom Scrollbar Styles */}
      <style>{`
      .custom-scrollbar::-webkit-scrollbar {
        width: 4px;
      }
      .custom-scrollbar::-webkit-scrollbar-track {
        background: transparent;
      }
      .custom-scrollbar::-webkit-scrollbar-thumb {
        background: #d1d5db;
        border-radius: 9999px;
      }
      .custom-scrollbar::-webkit-scrollbar-thumb:hover {
        background: #9ca3af;
      }
    `}</style>
    </div>
  );
}
