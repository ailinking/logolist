"use client"

import { useState, useEffect } from "react"
import { toast, Toaster } from "react-hot-toast"
import { Loader2, Search, Save } from "lucide-react"

// Simple debounce hook implementation
function useDebounceValue(value: string, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState(value)
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)
    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])
  return debouncedValue
}

type Company = {
  id: number
  name: string
  domain: string
  logoUrl: string
  affiliateUrl: string | null
  searchCount: number
}

type Pagination = {
  total: number
  pages: number
  page: number
  limit: number
}

export default function AdminDashboard() {
  const [companies, setCompanies] = useState<Company[]>([])
  const [pagination, setPagination] = useState<Pagination | null>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const debouncedSearch = useDebounceValue(search, 500)
  const [page, setPage] = useState(1)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editValue, setEditValue] = useState("")

  const fetchCompanies = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
        search: debouncedSearch,
      })
      const res = await fetch(`/api/admin/companies?${params}`)
      const data = await res.json()
      setCompanies(data.companies)
      setPagination(data.pagination)
    } catch (error) {
      toast.error("Failed to fetch companies")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCompanies()
  }, [page, debouncedSearch])

  const handleSave = async (id: number) => {
    try {
      const res = await fetch(`/api/admin/companies/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ affiliateUrl: editValue }),
      })
      
      if (!res.ok) throw new Error("Failed to update")
      
      toast.success("Affiliate URL updated")
      setCompanies(companies.map(c => 
        c.id === id ? { ...c, affiliateUrl: editValue } : c
      ))
      setEditingId(null)
    } catch (error) {
      toast.error("Failed to update URL")
    }
  }

  const startEdit = (company: Company) => {
    setEditingId(company.id)
    setEditValue(company.affiliateUrl || "")
  }

  return (
    <div>
      <Toaster position="top-right" />
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Affiliate Links Management</h1>
          <p className="mt-2 text-sm text-gray-700">
            Manage affiliate URLs for companies.
          </p>
        </div>
      </div>
      
      <div className="mt-6 flex gap-4">
        <div className="relative flex-1 max-w-sm">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full rounded-md border-0 py-1.5 pl-10 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
            placeholder="Search companies..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="mt-8 flow-root">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                      Company
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Domain
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Affiliate URL
                    </th>
                    <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {loading ? (
                    <tr>
                      <td colSpan={4} className="py-10 text-center">
                        <Loader2 className="h-8 w-8 animate-spin mx-auto text-gray-400" />
                      </td>
                    </tr>
                  ) : companies.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-10 text-center text-gray-500">
                        No companies found.
                      </td>
                    </tr>
                  ) : (
                    companies.map((company) => (
                      <tr key={company.id}>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                          <div className="flex items-center gap-3">
                            <img src={company.logoUrl} alt="" className="h-8 w-8 rounded-full object-contain bg-gray-50" />
                            {company.name}
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {company.domain}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {editingId === company.id ? (
                            <div className="flex gap-2">
                              <input
                                type="text"
                                className="block w-full rounded-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 px-2"
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                placeholder="https://..."
                              />
                              <button
                                onClick={() => handleSave(company.id)}
                                className="inline-flex items-center rounded-md bg-indigo-600 px-2.5 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
                              >
                                <Save className="h-4 w-4" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 max-w-xs truncate" title={company.affiliateUrl || ""}>
                              {company.affiliateUrl ? (
                                <a href={company.affiliateUrl} target="_blank" rel="noreferrer" className="text-indigo-600 hover:text-indigo-900 truncate block">
                                  {company.affiliateUrl}
                                </a>
                              ) : (
                                <span className="text-gray-400 italic">No link</span>
                              )}
                            </div>
                          )}
                        </td>
                        <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                          {editingId !== company.id && (
                            <button
                              onClick={() => startEdit(company)}
                              className="text-indigo-600 hover:text-indigo-900"
                            >
                              Edit
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {pagination && (
        <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 mt-4">
          <div className="flex flex-1 justify-between sm:hidden">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
              disabled={page === pagination.pages}
              className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">{(pagination.page - 1) * pagination.limit + 1}</span> to <span className="font-medium">{Math.min(pagination.page * pagination.limit, pagination.total)}</span> of <span className="font-medium">{pagination.total}</span> results
              </p>
            </div>
            <div>
              <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                >
                  <span className="sr-only">Previous</span>
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
                  </svg>
                </button>
                <span className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 focus:outline-offset-0">
                  Page {page} of {pagination.pages}
                </span>
                <button
                  onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
                  disabled={page === pagination.pages}
                  className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                >
                  <span className="sr-only">Next</span>
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                  </svg>
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
