import React, { useState, useEffect, useCallback, useRef } from 'react'
import ServiceForm from './ServiceForm'
import { createService, deleteService, getAllServices, IService, ServiceFormData, updateService } from '@/api/services/servicesApi'
import AdminLayout from '../AdminLayout'
import Pagination from '@/components/shared/Pagination'
import { SkeletonBlock, StatCardSkeletons, TableSkeleton } from '@/components/shared/Skeleton'
import type { PaginationMeta } from '@/types'
import { createEmptyPagination, DEFAULT_PAGE_SIZE, PAGE_SIZE_OPTIONS } from '@/utils/pagination'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'

const EMPTY_PAGINATION: PaginationMeta = createEmptyPagination()

const Modal: React.FC<{ title: string; onClose: () => void; children: React.ReactNode }> = ({ title, onClose, children }) => (
  <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
    <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" onClick={onClose} />
    <div className="relative z-10 bg-white rounded-2xl shadow-[0_24px_64px_rgba(0,0,0,0.18)] w-full max-w-[520px] max-h-[90vh] overflow-y-auto">
      <div className="flex items-center justify-between px-6 py-4 border-b border-[#F0DDD5]">
        <h3 className="text-[15px] font-bold text-[#2d2d2d] m-0 font-serif">{title}</h3>
        <button
          onClick={onClose}
          className="w-7 h-7 rounded-full bg-[#FDF6F2] flex items-center justify-center border-none cursor-pointer text-[#aaa] hover:text-[#C49A7A] transition-colors"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
      <div className="px-6 py-5">{children}</div>
    </div>
  </div>
)

const DeleteConfirm: React.FC<{
  service: IService
  onConfirm: () => void
  onCancel: () => void
  loading: boolean
}> = ({ service, onConfirm, onCancel, loading }) => (
  <div className="fixed inset-0 z-[400] flex items-center justify-center p-4">
    <div className="absolute inset-0 bg-black/45 backdrop-blur-[2px]" onClick={onCancel} />
    <div className="relative z-10 bg-white rounded-2xl shadow-[0_24px_64px_rgba(0,0,0,0.20)] w-full max-w-[360px] p-6 text-center">
      <div className="w-12 h-12 rounded-full bg-[#FFEBEE] flex items-center justify-center mx-auto mb-3">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#E53935" strokeWidth="2" strokeLinecap="round">
          <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" />
        </svg>
      </div>
      <h3 className="text-[16px] font-bold text-[#2d2d2d] m-0 mb-1.5 font-serif">Delete Service?</h3>
      <p className="text-[12px] text-[#888] m-0 mb-1 leading-relaxed">You are about to delete</p>
      <p className="text-[13px] font-bold text-[#C49A7A] m-0 mb-4 font-serif">"{service.name}"</p>
      <p className="text-[11px] text-[#aaa] m-0 mb-5">
        This action cannot be undone. All data related to this service will be permanently removed.
      </p>
      <div className="flex gap-2.5">
        <button
          onClick={onCancel}
          className="flex-1 py-2.5 bg-white border-2 border-[#F0DDD5] text-[#888] text-[12px] font-serif rounded-xl cursor-pointer hover:bg-[#FDF6F2] transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          disabled={loading}
          className="flex-1 py-2.5 bg-[#E53935] text-white text-[12px] font-semibold font-serif rounded-xl border-none cursor-pointer hover:bg-[#C62828] transition-colors disabled:opacity-60 flex items-center justify-center gap-1.5"
        >
          {loading && (
            <svg className="animate-spin" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 12a9 9 0 1 1-6.219-8.56" />
            </svg>
          )}
          {loading ? 'Deleting...' : 'Yes, Delete'}
        </button>
      </div>
    </div>
  </div>
)

const ManageServices: React.FC = () => {
  const [services, setServices] = useState<IService[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [filterActive, setFilterActive] = useState<'all' | 'active' | 'inactive'>('all')
  const [showCreate, setShowCreate] = useState(false)
  const [editService, setEditService] = useState<IService | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<IService | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [pagination, setPagination] = useState<PaginationMeta>(EMPTY_PAGINATION)
  const pageSize = DEFAULT_PAGE_SIZE
  const debouncedSearch = useDebouncedValue(search)
  const hasLoadedOnceRef = useRef(false)

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const fetchServices = useCallback(async (page = currentPage, preserveTable = hasLoadedOnceRef.current) => {
    if (preserveTable) {
      setRefreshing(true)
    } else {
      setLoading(true)
    }

    setError('')

    try {
      const response = await getAllServices({
        page: 1,
        limit: 500,
      })

      const normalizedSearch = debouncedSearch.trim().toLowerCase()
      const filteredItems = response.items.filter(service => {
        const matchesSearch =
          !normalizedSearch ||
          service.name.toLowerCase().includes(normalizedSearch) ||
          service.description.toLowerCase().includes(normalizedSearch)

        const matchesStatus =
          filterActive === 'all' ||
          (filterActive === 'active' && service.isActive) ||
          (filterActive === 'inactive' && !service.isActive)

        return matchesSearch && matchesStatus
      })

      const totalItems = filteredItems.length
      const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))
      const safePage = Math.min(Math.max(1, page), totalPages)
      const startIndex = (safePage - 1) * pageSize
      const paginatedItems = filteredItems.slice(startIndex, startIndex + pageSize)

      if (safePage !== currentPage) {
        setCurrentPage(safePage)
      }

      setServices(paginatedItems)
      setPagination({
        currentPage: safePage,
        perPage: pageSize,
        totalItems,
        totalPages,
        hasNextPage: safePage < totalPages,
        hasPreviousPage: safePage > 1,
      })
      hasLoadedOnceRef.current = true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load services')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [currentPage, debouncedSearch, filterActive, pageSize])

  useEffect(() => {
    void fetchServices(currentPage)
  }, [currentPage, fetchServices])

  useEffect(() => {
    setCurrentPage(1)
  }, [debouncedSearch, filterActive])

  const handleCreate = async (data: ServiceFormData) => {
    await createService(data)
    await fetchServices(currentPage, true)
    setShowCreate(false)
    showToast('Service created successfully!')
  }

  const handleUpdate = async (data: ServiceFormData) => {
    if (!editService) return
    await updateService(editService._id, data)
    await fetchServices(currentPage, true)
    setEditService(null)
    showToast('Service updated successfully!')
  }

  const handleToggleActive = async (service: IService) => {
    try {
      await updateService(service._id, { isActive: !service.isActive })
      setServices(prev => prev.map(s => s._id === service._id ? { ...s, isActive: !s.isActive } : s))
      showToast(`Service ${!service.isActive ? 'activated' : 'deactivated'}`)
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to update', 'error')
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleteLoading(true)
    try {
      await deleteService(deleteTarget._id)
      await fetchServices(currentPage, true)
      setDeleteTarget(null)
      showToast('Service deleted successfully!')
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to delete', 'error')
    } finally {
      setDeleteLoading(false)
    }
  }

  const stats = {
    total: pagination.totalItems,
    active: filterActive === 'inactive' ? 0 : services.filter(s => s.isActive).length,
    inactive: filterActive === 'active' ? 0 : services.filter(s => !s.isActive).length,
  }

  return (
    <AdminLayout>
      {toast && (
        <div className={`fixed top-5 right-5 z-[500] flex items-center gap-2 px-4 py-3 rounded-xl shadow-[0_8px_24px_rgba(0,0,0,0.15)] text-white text-[12px] font-serif transition-all ${toast.type === 'success' ? 'bg-[#4CAF50]' : 'bg-[#E53935]'}`}>
          {toast.type === 'success'
            ? <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>
            : <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
          }
          {toast.msg}
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-between mb-5">
          <div className="space-y-2">
            <SkeletonBlock className="h-7 w-40" />
            <SkeletonBlock className="h-3 w-36" />
          </div>
          <SkeletonBlock className="h-10 w-32 rounded-xl" />
        </div>
      )}
      {!loading && (
        <div className="flex items-center justify-between mb-5">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-[20px] font-bold text-[#2d2d2d] m-0 font-serif">Manage Services</h1>
              {refreshing && <span className="text-[11px] text-[#C49A7A] font-serif">Updating...</span>}
            </div>
            <p className="text-[12px] text-[#aaa] mt-0.5 mb-0">{stats.total} services · {stats.active} active</p>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-1.5 text-white text-[12px] font-semibold font-serif px-4 py-2 rounded-xl border-none cursor-pointer hover:opacity-90 transition-opacity shadow-[0_4px_14px_rgba(196,154,122,0.3)]"
            style={{ background: 'linear-gradient(135deg,#C49A7A,#E8B89A)' }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add Service
          </button>
        </div>
      )}

      {loading && (
        <div className="grid grid-cols-3 gap-3 mb-5">
          <StatCardSkeletons count={3} />
        </div>
      )}
      {!loading && (
        <div className="grid grid-cols-3 gap-3 mb-5">
          {[
            { label: 'Total Services', value: stats.total, icon: '💆', color: '#C49A7A', bg: '#FDF0EB' },
            { label: 'Active Services', value: stats.active, icon: '✅', color: '#4CAF50', bg: '#E8F5E9' },
            { label: 'Inactive Services', value: stats.inactive, icon: '⏸️', color: '#aaa', bg: '#F5F5F5' },
          ].map(({ label, value, icon, color, bg }) => (
            <div key={label} className="bg-white rounded-xl border border-[#F0DDD5] px-4 py-3 flex items-center gap-3 shadow-[0_2px_8px_rgba(196,154,122,0.07)]">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center text-[17px] flex-shrink-0" style={{ background: bg }}>
                {icon}
              </div>
              <div>
                <p className="text-[18px] font-bold m-0 font-serif leading-none" style={{ color }}>{value}</p>
                <p className="text-[11px] text-[#aaa] m-0 mt-0.5">{label}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {loading && (
        <div className="flex items-center gap-2 mb-4">
          <SkeletonBlock className="h-9 w-[220px] rounded-xl" />
          <SkeletonBlock className="h-9 w-16 rounded-xl" />
          <SkeletonBlock className="h-9 w-20 rounded-xl" />
          <SkeletonBlock className="h-9 w-20 rounded-xl" />
        </div>
      )}
      {!loading && (
        <div className="flex items-center gap-2 mb-4">
          <div className="relative w-[220px]">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#C49A7A" strokeWidth="1.8" className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search services..."
              className="w-full pl-8 pr-3 py-[7px] border-2 border-[#F0DDD5] rounded-xl text-[12px] text-[#2d2d2d] outline-none focus:border-[#C49A7A] bg-white font-serif"
            />
          </div>

          {(['all', 'active', 'inactive'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilterActive(f)}
              className={`px-3.5 py-[7px] rounded-xl text-[11px] capitalize font-serif border-2 cursor-pointer transition-all ${filterActive === f ? 'bg-[#C49A7A] text-white border-[#C49A7A]' : 'bg-white text-[#888] border-[#F0DDD5] hover:border-[#C49A7A] hover:text-[#C49A7A]'}`}
            >
              {f}
            </button>
          ))}
        </div>
      )}

      <div className="bg-white rounded-2xl border border-[#F0DDD5] shadow-[0_2px_16px_rgba(196,154,122,0.08)] overflow-hidden">
        <div className="table-scroll-head grid gap-0 border-b border-[#F0DDD5] px-5 py-2.5 bg-[#FDF6F2]" style={{ gridTemplateColumns: '1fr 2fr 90px 90px 80px 100px' }}>
          {['Name', 'Description', 'Price', 'Duration', 'Status', 'Actions'].map(h => (
            <span key={h} className="text-[10px] font-bold text-[#aaa] uppercase tracking-[0.08em] font-serif">{h}</span>
          ))}
        </div>

        {loading && <TableSkeleton columns={6} rows={5} />}

        {!loading && error && (
          <div className="py-10 text-center">
            <p className="text-[12px] text-[#E53935] font-serif">{error}</p>
            <button
              onClick={() => { void fetchServices(currentPage, true) }}
              className="mt-2.5 text-[11px] text-[#C49A7A] border border-[#C49A7A] px-4 py-1.5 rounded-lg font-serif cursor-pointer hover:bg-[#FDF0EB] transition-colors bg-white"
            >
              Retry
            </button>
          </div>
        )}

        {!loading && !error && services.length === 0 && (
          <div className="py-14 text-center">
            <div className="w-12 h-12 rounded-full bg-[#FDF0EB] flex items-center justify-center mx-auto mb-3 text-[22px]">💆</div>
            <p className="text-[13px] font-bold text-[#2d2d2d] m-0 mb-1 font-serif">No services found</p>
            <p className="text-[11px] text-[#aaa] m-0">
              {debouncedSearch ? 'Try a different search term' : 'Click "Add Service" to create your first service'}
            </p>
          </div>
        )}

        {!loading && !error && (
          <div className="table-scroll-area">
            {services.map(s => (
              <div
                key={s._id}
                className={`grid items-center px-5 py-3 gap-0 border-b border-[#F9F0EC] last:border-b-0 hover:bg-[#FDFAF8] transition-colors ${!s.isActive ? 'opacity-60' : ''}`}
                style={{ gridTemplateColumns: '1fr 2fr 90px 90px 80px 100px' }}
              >
            <div className="pr-3">
              <p className="text-[12px] font-bold text-[#2d2d2d] m-0 font-serif truncate">{s.name}</p>
            </div>

            <div className="pr-3">
              <p className="text-[11px] text-[#888] m-0 line-clamp-2 leading-relaxed">{s.description}</p>
            </div>

            <div>
              <span className="text-[12px] font-bold text-[#C49A7A] font-serif">₹{s.price.toLocaleString()}</span>
            </div>

            <div>
              <span className="text-[12px] text-[#666] font-serif">{s.duration} min</span>
            </div>

            <div>
              <button
                onClick={() => handleToggleActive(s)}
                className={`relative w-9 h-[18px] rounded-full transition-all duration-200 border-none cursor-pointer ${s.isActive ? 'bg-[#C49A7A]' : 'bg-[#E0E0E0]'}`}
              >
                <span className={`absolute top-0.5 w-3.5 h-3.5 bg-white rounded-full shadow-sm transition-all duration-200 ${s.isActive ? 'left-[20px]' : 'left-0.5'}`} />
              </button>
              <p className={`text-[10px] mt-0.5 m-0 ${s.isActive ? 'text-[#C49A7A]' : 'text-[#aaa]'}`}>{s.isActive ? 'Active' : 'Inactive'}</p>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setEditService(s)}
                className="w-7 h-7 rounded-lg bg-[#FDF0EB] flex items-center justify-center border-none cursor-pointer hover:bg-[#F5C8BC] transition-colors"
                title="Edit"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#C49A7A" strokeWidth="2" strokeLinecap="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
              </button>
              <button
                onClick={() => setDeleteTarget(s)}
                className="w-7 h-7 rounded-lg bg-[#FFEBEE] flex items-center justify-center border-none cursor-pointer hover:bg-[#FFCDD2] transition-colors"
                title="Delete"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#E53935" strokeWidth="2" strokeLinecap="round">
                  <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" />
                </svg>
              </button>
            </div>
              </div>
            ))}
          </div>
        )}

        {!loading && !error && pagination.totalItems > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={pagination.totalPages}
            totalItems={pagination.totalItems}
            pageSize={pagination.perPage || pageSize}
            itemLabel="services"
            onPageChange={setCurrentPage}
            pageSizeOptions={PAGE_SIZE_OPTIONS}
          />
        )}
      </div>

      {showCreate && (
        <Modal title="Add New Service" onClose={() => setShowCreate(false)}>
          <ServiceForm mode="create" onSubmit={handleCreate} onCancel={() => setShowCreate(false)} />
        </Modal>
      )}

      {editService && (
        <Modal title="Edit Service" onClose={() => setEditService(null)}>
          <ServiceForm mode="edit" initial={editService} onSubmit={handleUpdate} onCancel={() => setEditService(null)} />
        </Modal>
      )}

      {deleteTarget && (
        <DeleteConfirm service={deleteTarget} onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} loading={deleteLoading} />
      )}
    </AdminLayout>
  )
}

export default ManageServices
