import { createUser, deleteUser, filterUsersByRole, getAllUsers, updateUser, UserFormData, UserRoleType } from '@/api/Userapi';
import { IUser } from '@/types';
import React, { useState, useEffect, useCallback, useRef } from 'react'
import UserForm from './Userform';
import Pagination from '@/components/shared/Pagination';
import { SkeletonBlock, StatCardSkeletons, TableSkeleton } from '@/components/shared/Skeleton';
import type { PaginationMeta } from '@/types';
import { createEmptyPagination, DEFAULT_PAGE_SIZE, PAGE_SIZE_OPTIONS } from '@/utils/pagination';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { getWorkingDayLabel } from '@/features/appointments/appointmentUtils';


// ── Modal ─────────────────────────────────────────────────
const Modal: React.FC<{ title: string; onClose: () => void; children: React.ReactNode }> = ({ title, onClose, children }) => (
  <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
    <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" onClick={onClose} />
    <div className="relative z-10 bg-white rounded-2xl shadow-[0_24px_64px_rgba(0,0,0,0.18)] w-full max-w-[540px] max-h-[90vh] overflow-y-auto">
      <div className="flex items-center justify-between px-6 py-5 border-b border-[#F0DDD5]">
        <h3 className="text-[16px] font-bold text-[#2d2d2d] m-0 font-serif">{title}</h3>
        <button onClick={onClose} className="w-8 h-8 rounded-full bg-[#FDF6F2] flex items-center justify-center border-none cursor-pointer text-[#aaa] hover:text-[#C49A7A] transition-colors">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
      <div className="px-6 py-5">{children}</div>
    </div>
  </div>
)

// ── Delete confirm ────────────────────────────────────────
const DeleteConfirm: React.FC<{
  user: IUser; onConfirm: () => void; onCancel: () => void; loading: boolean
}> = ({ user, onConfirm, onCancel, loading }) => (
  <div className="fixed inset-0 z-[400] flex items-center justify-center p-4">
    <div className="absolute inset-0 bg-black/45 backdrop-blur-[2px]" onClick={onCancel} />
    <div className="relative z-10 bg-white rounded-2xl shadow-[0_24px_64px_rgba(0,0,0,0.20)] w-full max-w-[360px] p-7 text-center">
      <div className="w-14 h-14 rounded-full bg-[#FFEBEE] flex items-center justify-center mx-auto mb-4">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#E53935" strokeWidth="2" strokeLinecap="round">
          <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/>
        </svg>
      </div>
      <h3 className="text-[17px] font-bold text-[#2d2d2d] m-0 mb-2 font-serif">Delete User?</h3>
      <p className="text-[14px] font-bold text-[#C49A7A] m-0 mb-2 font-serif">"{user.name}"</p>
      <p className="text-[12px] text-[#aaa] m-0 mb-6">This action cannot be undone.</p>
      <div className="flex gap-3">
        <button onClick={onCancel}
          className="flex-1 py-[11px] bg-white border-2 border-[#F0DDD5] text-[#888] text-[13px] font-serif rounded-xl cursor-pointer hover:bg-[#FDF6F2] transition-colors">
          Cancel
        </button>
        <button onClick={onConfirm} disabled={loading}
          className="flex-1 py-[11px] bg-[#E53935] text-white text-[13px] font-semibold font-serif rounded-xl border-none cursor-pointer hover:bg-[#C62828] transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
          {loading && <svg className="animate-spin" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>}
          {loading ? 'Deleting...' : 'Yes, Delete'}
        </button>
      </div>
    </div>
  </div>
)

// ── Config per role type ───────────────────────────────────
const ROLE_CONFIG = {
  staff: {
    label:   'Provider',
    plural:  'Providers',
    color:   '#7AC49A',
    bg:      '#E8F5E9',
    icon:    '✂️',
  },
  receptionist: {
    label:   'Receptionist',
    plural:  'Receptionists',
    color:   '#7A9EC4',
    bg:      '#EBF3FD',
    icon:    '💁',
  },
  customer: {
    label:   'Customer',
    plural:  'Customers',
    color:   '#C49A7A',
    bg:      '#FDF0EB',
    icon:    '👤',
  },
}

// ── Props ─────────────────────────────────────────────────
interface UserTableProps {
  roleType: UserRoleType
  Layout:   React.FC<{ children: React.ReactNode }>
}

const UserTable: React.FC<UserTableProps> = ({ roleType, Layout }) => {
  const cfg = ROLE_CONFIG[roleType]
  const EMPTY_PAGINATION: PaginationMeta = createEmptyPagination()

  const [users,         setUsers]         = useState<IUser[]>([])
  const [loading,       setLoading]       = useState(true)
  const [error,         setError]         = useState('')
  const [search,        setSearch]        = useState('')
  const [showCreate,    setShowCreate]    = useState(false)
  const [editUser,      setEditUser]      = useState<IUser | null>(null)
  const [deleteTarget,  setDeleteTarget]  = useState<IUser | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)
  const [pagination, setPagination] = useState<PaginationMeta>(EMPTY_PAGINATION)
  const [refreshing, setRefreshing] = useState(false)
  const debouncedSearch = useDebouncedValue(search)
  const hasLoadedOnceRef = useRef(false)

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  // ── Fetch & filter by role name ───────────────────────
  const fetchUsers = useCallback(async (preserveTable = hasLoadedOnceRef.current) => {
    if (preserveTable) {
      setRefreshing(true)
    } else {
      setLoading(true)
    }
    setError('')
    try {
      const response = await getAllUsers({
        page: currentPage,
        limit: pageSize,
        search: debouncedSearch.trim() || undefined,
        role: roleType,
      })
      setUsers(filterUsersByRole(response.items, roleType))
      setPagination(response.pagination)
      hasLoadedOnceRef.current = true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [currentPage, debouncedSearch, pageSize, roleType])

  useEffect(() => { fetchUsers() }, [fetchUsers])

  useEffect(() => {
    setCurrentPage(1)
  }, [pageSize, debouncedSearch, roleType])

  // ── CRUD handlers ─────────────────────────────────────
  const handleCreate = async (data: UserFormData) => {
    await createUser(data)
    await fetchUsers(true)
    setShowCreate(false)
    showToast(`${cfg.label} created successfully!`)
  }

  const handleUpdate = async (data: UserFormData) => {
    if (!editUser) return
    await updateUser(editUser._id, data)
    await fetchUsers(true)
    setEditUser(null)
    showToast(`${cfg.label} updated successfully!`)
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleteLoading(true)
    try {
      await deleteUser(deleteTarget._id)
      setUsers(prev => prev.filter(u => u._id !== deleteTarget._id))
      setDeleteTarget(null)
      showToast(`${cfg.label} deleted successfully!`)
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to delete', 'error')
    } finally {
      setDeleteLoading(false)
    }
  }

  return (
    <Layout>

      {/* Toast */}
      {toast && (
        <div className={`fixed top-5 right-5 z-[500] flex items-center gap-2.5 px-5 py-3.5 rounded-xl shadow-lg text-white text-[13px] font-serif
          ${toast.type === 'success' ? 'bg-[#4CAF50]' : 'bg-[#E53935]'}`}>
          {toast.type === 'success'
            ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
            : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/></svg>
          }
          {toast.msg}
        </div>
      )}

      {/* Header */}
      {loading && (
        <div className="flex items-center justify-between mb-6">
          <div className="space-y-2">
            <SkeletonBlock className="h-7 w-52" />
            <SkeletonBlock className="h-3 w-40" />
          </div>
          <SkeletonBlock className="h-11 w-36 rounded-xl" />
        </div>
      )}
      {!loading && (
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[22px] font-bold text-[#2d2d2d] m-0 font-serif">Manage {cfg.plural}</h1>
          <p className="text-[13px] text-[#aaa] mt-1 mb-0">{pagination.totalItems} {cfg.plural.toLowerCase()} total {refreshing ? '· updating...' : ''}</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 text-white text-[13px] font-semibold font-serif px-5 py-[10px] rounded-xl border-none cursor-pointer hover:opacity-90 transition-opacity shadow-[0_4px_14px_rgba(196,154,122,0.3)]"
          style={{ background: 'linear-gradient(135deg,#C49A7A,#E8B89A)' }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Add {cfg.label}
        </button>
      </div>
      )}

      {/* Stat cards */}
      {loading && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          <StatCardSkeletons count={3} />
        </div>
      )}
      {!loading && (
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: `Total ${cfg.plural}`,   value: pagination.totalItems,                   color: cfg.color, bg: cfg.bg },
          { label: 'Available',             value: users.filter(u => u.isAvailable).length,  color: '#4CAF50', bg: '#E8F5E9' },
          { label: 'Unavailable',           value: users.filter(u => !u.isAvailable).length, color: '#aaa',    bg: '#F5F5F5' },
        ].map(({ label, value, color, bg }) => (
          <div key={label} className="bg-white rounded-xl border border-[#F0DDD5] px-5 py-4 flex items-center gap-4 shadow-[0_2px_8px_rgba(196,154,122,0.07)]">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center text-[20px]" style={{ background: bg }}>
              {cfg.icon}
            </div>
            <div>
              <p className="text-[20px] font-bold m-0 font-serif" style={{ color }}>{value}</p>
              <p className="text-[11px] text-[#aaa] m-0">{label}</p>
            </div>
          </div>
        ))}
      </div>
      )}

      {/* Search */}
      {loading && <SkeletonBlock className="h-11 w-full rounded-xl mb-5" />}
      {!loading && (
      <div className="relative mb-5">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#C49A7A" strokeWidth="1.8"
          className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder={`Search ${cfg.plural.toLowerCase()}...`}
          className="w-full pl-9 pr-4 py-[10px] border-2 border-[#F0DDD5] rounded-xl text-[13px] outline-none focus:border-[#C49A7A] bg-white font-serif" />
      </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-2xl border border-[#F0DDD5] shadow-[0_2px_16px_rgba(196,154,122,0.08)] overflow-hidden">

        {/* Header row */}
        <div className="table-scroll-head grid px-6 py-3 bg-[#FDF6F2] border-b border-[#F0DDD5]"
          style={{ gridTemplateColumns: '48px 1fr 1fr 120px 90px 100px' }}>
          {['#', 'Name', 'Email', 'Phone', 'Status', 'Actions'].map(h => (
            <span key={h} className="text-[11px] font-bold text-[#aaa] uppercase tracking-[0.08em] font-serif">{h}</span>
          ))}
        </div>

        {/* Loading */}
        {loading && (
          <TableSkeleton columns={6} rows={5} />
        )}

        {/* Error */}
        {!loading && error && (
          <div className="py-12 text-center">
            <p className="text-[13px] text-[#E53935] font-serif mb-3">{error}</p>
            <button onClick={fetchUsers}
              className="text-[12px] text-[#C49A7A] border border-[#C49A7A] px-4 py-2 rounded-lg font-serif cursor-pointer hover:bg-[#FDF0EB] bg-white transition-colors">
              Retry
            </button>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && users.length === 0 && (
          <div className="py-16 text-center">
            <div className="text-[32px] mb-3">{cfg.icon}</div>
            <p className="text-[14px] font-bold text-[#2d2d2d] m-0 mb-1 font-serif">No {cfg.plural.toLowerCase()} found</p>
            <p className="text-[12px] text-[#aaa] m-0">
              {debouncedSearch ? 'Try a different search' : `Click "Add ${cfg.label}" to get started`}
            </p>
          </div>
        )}

        {/* Rows */}
        {!loading && !error && (
          <div className="table-scroll-area">
            {users.map(u => (
              <div key={u._id}
                className="grid items-center px-6 py-4 border-b border-[#F9F0EC] last:border-b-0 hover:bg-[#FDFAF8] transition-colors"
                style={{ gridTemplateColumns: '48px 1fr 1fr 120px 90px 100px' }}
              >
            {/* Avatar */}
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-[13px] font-bold text-white flex-shrink-0"
              style={{ background: `linear-gradient(135deg,${cfg.color},${cfg.color}99)` }}>
              {u.name.charAt(0).toUpperCase()}
            </div>

            {/* Name */}
            <div className="pr-3">
              <p className="text-[13px] font-bold text-[#2d2d2d] m-0 font-serif truncate">{u.name}</p>
              {roleType === 'staff' && u.WorkingDay && (
                <p className="text-[10px] text-[#aaa] m-0">{getWorkingDayLabel(u.WorkingDay)}</p>
              )}
            </div>

            {/* Email */}
            <div className="pr-3">
              <p className="text-[12px] text-[#666] m-0 truncate">{u.email}</p>
              {u.phonenumber && <p className="text-[11px] text-[#aaa] m-0">{u.phonenumber}</p>}
            </div>

            {/* Phone */}
            <div>
              <p className="text-[12px] text-[#666] m-0">{u.phonenumber}</p>
            </div>

            {/* Available badge */}
            <div>
              <span className={`text-[11px] px-2.5 py-1 rounded-full font-semibold
                ${u.isAvailable ? 'bg-[#E8F5E9] text-[#4CAF50]' : 'bg-[#F5F5F5] text-[#aaa]'}`}>
                {u.isAvailable ? 'Active' : 'Inactive'}
              </span>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button onClick={() => setEditUser(u)}
                className="w-8 h-8 rounded-lg bg-[#FDF0EB] flex items-center justify-center border-none cursor-pointer hover:bg-[#F5C8BC] transition-colors" title="Edit">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#C49A7A" strokeWidth="2" strokeLinecap="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
              </button>
              <button onClick={() => setDeleteTarget(u)}
                className="w-8 h-8 rounded-lg bg-[#FFEBEE] flex items-center justify-center border-none cursor-pointer hover:bg-[#FFCDD2] transition-colors" title="Delete">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#E53935" strokeWidth="2" strokeLinecap="round">
                  <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/>
                </svg>
              </button>
            </div>
              </div>
            ))}
          </div>
        )}

        {!loading && !error && users.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={pagination.totalPages}
            totalItems={pagination.totalItems}
            pageSize={pagination.perPage || pageSize}
            itemLabel={cfg.plural.toLowerCase()}
            onPageChange={setCurrentPage}
            onPageSizeChange={nextPageSize => {
              setPageSize(nextPageSize)
              setCurrentPage(1)
            }}
            pageSizeOptions={PAGE_SIZE_OPTIONS}
          />
        )}
      </div>

      {/* Modals */}
      {showCreate && (
        <Modal title={`Add ${cfg.label}`} onClose={() => setShowCreate(false)}>
          <UserForm mode="create" roleType={roleType} onSubmit={handleCreate} onCancel={() => setShowCreate(false)} />
        </Modal>
      )}
      {editUser && (
        <Modal title={`Edit ${cfg.label}`} onClose={() => setEditUser(null)}>
          <UserForm mode="edit" roleType={roleType} initial={editUser} onSubmit={handleUpdate} onCancel={() => setEditUser(null)} />
        </Modal>
      )}
      {deleteTarget && (
        <DeleteConfirm user={deleteTarget} onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} loading={deleteLoading} />
      )}

    </Layout>
  )
}

export default UserTable
