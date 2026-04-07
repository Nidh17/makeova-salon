import React, { useState, useEffect, useCallback } from 'react'
import AdminLayout from './AdminLayout'
import Pagination from '@/components/shared/Pagination'
import { SkeletonBlock, TableSkeleton } from '@/components/shared/Skeleton'
//import { IPermission, IRole, MODULES } from '@/types'
//import { getAllRoles } from '@/api/Userapi'
import {
  getAllRoles, createRole, updateRole, deleteRole,
  getAllPermissions, createPermission, updatePermission, deletePermission,
  MODULES,
  type IRole, type IPermission, type IPermissionRef,
} from '@/api/Roleapi'
import type { PaginationMeta } from '@/types'
import { createEmptyPagination, DEFAULT_PAGE_SIZE, PAGE_SIZE_OPTIONS } from '@/utils/pagination'
import { KeyRound, Shield } from 'lucide-react'



// Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
// Shared payload type - single source of truth
// Matches createRole / updateRole signatures exactly
// Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
type RolePayload = Parameters<typeof createRole>[0]

// Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
// Helpers
// Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
const getPermIds = (perms: IPermissionRef[] | string[]): string[] =>
  perms.map(p => typeof p === 'string' ? p : p._id)

// Resolves a permission to its display name.
// - Populated IPermissionRef object Ã¢â€ â€™ use p.name directly
// - Raw ObjectId string             Ã¢â€ â€™ look up in the idÃ¢â€ â€™name map
//   and fall back to last-6-chars of id so raw IDs never appear in the UI
const resolvePermName = (
  p: IPermissionRef | string,
  lookup: Record<string, string>
): string => {
  if (typeof p === 'string') {
    return lookup[p] ?? p.slice(-6)   // fallback: last 6 chars of id
  }
  return p.name
}

// Colour style for a permission badge
const permColor = (name: string): string => {
  const n = name.toLowerCase()
  if (n === 'delete') return 'bg-[#FFEBEE] text-[#E53935]'
  if (n === 'create') return 'bg-[#E8F5E9] text-[#4CAF50]'
  if (n === 'update') return 'bg-[#FFF8E1] text-[#FF9800]'
  if (n === 'read')   return 'bg-[#E3F2FD] text-[#1565C0]'
  return 'bg-[#F5F5F5] text-[#666]'
}

const normalizeModuleName = (value: string): string =>
  value.trim().toLowerCase().replace(/\s+/g, '_')

const EMPTY_PAGINATION: PaginationMeta = createEmptyPagination()

// Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
// Modal
// Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
const Modal: React.FC<{
  title: string
  onClose: () => void
  children: React.ReactNode
  wide?: boolean
}> = ({ title, onClose, children, wide }) => (
  <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
    <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" onClick={onClose} />
    <div className={`relative z-10 bg-white rounded-2xl shadow-[0_24px_64px_rgba(0,0,0,0.18)] w-full max-h-[92vh] overflow-y-auto ${wide ? 'max-w-[780px]' : 'max-w-[520px]'}`}>
      <div className="flex items-center justify-between px-6 py-5 border-b border-[#F0DDD5] sticky top-0 bg-white z-10">
        <h3 className="text-[16px] font-bold text-[#2d2d2d] m-0 font-serif">{title}</h3>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-full bg-[#FDF6F2] flex items-center justify-center border-none cursor-pointer text-[#aaa] hover:text-[#C49A7A] transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
      <div className="px-6 py-5">{children}</div>
    </div>
  </div>
)

// Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
// Delete confirm
// Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
const DeleteConfirm: React.FC<{
  name: string
  onConfirm: () => void
  onCancel: () => void
  loading: boolean
}> = ({ name, onConfirm, onCancel, loading }) => (
  <div className="fixed inset-0 z-[400] flex items-center justify-center p-4">
    <div className="absolute inset-0 bg-black/45 backdrop-blur-[2px]" onClick={onCancel} />
    <div className="relative z-10 bg-white rounded-2xl shadow-[0_24px_64px_rgba(0,0,0,0.20)] w-full max-w-[360px] p-7 text-center">
      <div className="w-14 h-14 rounded-full bg-[#FFEBEE] flex items-center justify-center mx-auto mb-4">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#E53935" strokeWidth="2" strokeLinecap="round">
          <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" />
        </svg>
      </div>
      <h3 className="text-[17px] font-bold text-[#2d2d2d] m-0 mb-2 font-serif">Delete?</h3>
      <p className="text-[14px] font-bold text-[#C49A7A] m-0 mb-4 font-serif">"{name}"</p>
      <p className="text-[12px] text-[#aaa] m-0 mb-6">This action cannot be undone.</p>
      <div className="flex gap-3">
        <button
          onClick={onCancel}
          className="flex-1 py-[11px] bg-white border-2 border-[#F0DDD5] text-[#888] text-[13px] font-serif rounded-xl cursor-pointer hover:bg-[#FDF6F2] transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          disabled={loading}
          className="flex-1 py-[11px] bg-[#E53935] text-white text-[13px] font-semibold font-serif rounded-xl border-none cursor-pointer hover:bg-[#C62828] disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {loading && (
            <svg className="animate-spin" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 12a9 9 0 1 1-6.219-8.56" />
            </svg>
          )}
          {loading ? 'Deleting...' : 'Yes, Delete'}
        </button>
      </div>
    </div>
  </div>
)

// Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
// Role Form Ã¢â‚¬â€ with permission matrix
// Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
interface RoleFormProps {
  mode:        'create' | 'edit'
  initial?:    IRole
  permissions: IPermission[]
  // Ã¢Å“â€¦ onSubmit now uses RolePayload (includes canAssignRoles) Ã¢â‚¬â€ no more type mismatch
  onSubmit:    (data: RolePayload) => Promise<void>
  onCancel:    () => void
}

const RoleForm: React.FC<RoleFormProps> = ({ mode, initial, permissions, onSubmit, onCancel }) => {
  const [name,        setName]        = useState(initial?.name ?? '')
  const [description, setDescription] = useState(initial?.description ?? '')
  const initialCustomModules = Array.from(new Set(
    (initial?.moduleAccess ?? [])
      .map(ma => ma.module)
      .filter(mod => !MODULES.includes(mod as typeof MODULES[number]))
  ))
  const [customModules, setCustomModules] = useState<string[]>(initialCustomModules)
  const [newModuleName, setNewModuleName] = useState('')

  const [matrix, setMatrix] = useState<Record<string, Set<string>>>(() => {
    const m: Record<string, Set<string>> = {}
    MODULES.forEach(mod => { m[mod] = new Set() })
    if (initial?.moduleAccess) {
      initial.moduleAccess.forEach(ma => {
        if (!m[ma.module]) m[ma.module] = new Set()
        m[ma.module] = new Set(getPermIds(ma.permission as IPermissionRef[]))
      })
    }
    return m
  })

  const [errors,  setErrors]  = useState<{ name?: string; description?: string }>({})
  const [loading, setLoading] = useState(false)
  const [apiErr,  setApiErr]  = useState('')
  const moduleList = Array.from(new Set([...MODULES, ...customModules]))

  const togglePerm = (mod: string, permId: string) => {
    setMatrix(prev => {
      const next = { ...prev, [mod]: new Set(prev[mod]) }
      next[mod].has(permId) ? next[mod].delete(permId) : next[mod].add(permId)
      return next
    })
  }

  const toggleAllModule = (mod: string) => {
    setMatrix(prev => {
      const allIds = permissions.map(p => p._id)
      const hasAll = allIds.every(id => prev[mod].has(id))
      return { ...prev, [mod]: hasAll ? new Set() : new Set(allIds) }
    })
  }

  const handleAddModule = () => {
    const normalized = normalizeModuleName(newModuleName)
    if (!normalized) return

    if (moduleList.includes(normalized)) {
      setApiErr(`Module "${normalized}" already exists`)
      return
    }

    setCustomModules(prev => [...prev, normalized])
    setMatrix(prev => ({ ...prev, [normalized]: new Set() }))
    setNewModuleName('')
    setApiErr('')
  }

  const handleRemoveModule = (mod: string) => {
    setCustomModules(prev => prev.filter(item => item !== mod))
    setMatrix(prev => {
      const next = { ...prev }
      delete next[mod]
      return next
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const errs: typeof errors = {}
    if (!name.trim())        errs.name        = 'Name is required'
    if (!description.trim()) errs.description = 'Description is required'
    setErrors(errs)
    if (Object.keys(errs).length > 0) return

    setLoading(true)
    setApiErr('')
    try {
      const moduleAccess = [...MODULES, ...customModules]
        .filter((mod, index, list) => list.indexOf(mod) === index)
        .filter(mod => matrix[mod] && matrix[mod].size > 0)
        .map(mod => ({ module: mod, permission: Array.from(matrix[mod]) }))

      // Ã¢Å“â€¦ canAssignRoles included Ã¢â‚¬â€ preserves existing value on edit, defaults to [] on create
      await onSubmit({
        name:           name.trim(),
        description:    description.trim(),
        moduleAccess,
        canAssignRoles: initial?.canAssignRoles ?? [],
      })
    } catch (err) {
      setApiErr(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const inp = (err?: string) =>
    `w-full px-3 py-[10px] border-2 rounded-[10px] text-[13px] font-serif outline-none transition-all bg-white
    ${err ? 'border-[#EF9A9A]' : 'border-[#F0DDD5] focus:border-[#C49A7A]'}`

  return (
    <form onSubmit={handleSubmit} noValidate>
      {apiErr && (
        <div className="flex items-center gap-2 bg-[#FFEBEE] border border-[#EF9A9A] rounded-xl px-4 py-3 mb-5">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#E53935" strokeWidth="2" strokeLinecap="round">
            <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <span className="text-[12px] text-[#E53935]">{apiErr}</span>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 mb-5">
        <div>
          <label className="text-[12px] text-[#888] block mb-[5px] font-serif">Role Name *</label>
          <input
            value={name}
            onChange={e => { setName(e.target.value); setErrors(p => ({ ...p, name: '' })) }}
            placeholder="e.g. receptionist"
            className={inp(errors.name)}
          />
          {errors.name && <p className="text-[11px] text-[#E53935] mt-1 m-0">{errors.name}</p>}
        </div>
        <div>
          <label className="text-[12px] text-[#888] block mb-[5px] font-serif">Description *</label>
          <input
            value={description}
            onChange={e => { setDescription(e.target.value); setErrors(p => ({ ...p, description: '' })) }}
            placeholder="Brief description..."
            className={inp(errors.description)}
          />
          {errors.description && <p className="text-[11px] text-[#E53935] mt-1 m-0">{errors.description}</p>}
        </div>
      </div>

      {/* Permission Matrix */}
      <div className="mb-5">
        <div className="flex items-center justify-between mb-3">
          <p className="text-[13px] font-bold text-[#2d2d2d] m-0 font-serif">Module Permissions</p>
          <p className="text-[11px] text-[#aaa] m-0">Select permissions per module</p>
        </div>

        <div className="mb-4 rounded-xl border border-[#F0DDD5] bg-[#FFFCFA] p-4">
          <p className="m-0 mb-2 text-[12px] font-semibold text-[#2d2d2d] font-serif">Add Custom Module</p>
          <div className="flex gap-2">
            <input
              value={newModuleName}
              onChange={e => { setNewModuleName(e.target.value); setApiErr('') }}
              placeholder="e.g. inventory_management"
              className={inp()}
            />
            <button
              type="button"
              onClick={handleAddModule}
              className="whitespace-nowrap rounded-xl border-none px-4 py-[10px] text-[12px] font-semibold text-white font-serif cursor-pointer hover:opacity-90"
              style={{ background: 'linear-gradient(135deg,#C49A7A,#E8B89A)' }}
            >
              Add Module
            </button>
          </div>
          <p className="m-0 mt-2 text-[11px] text-[#aaa] font-serif">
            Custom modules added here are included in the role payload and stored through the role API.
          </p>
        </div>

        <div className="border border-[#F0DDD5] rounded-xl overflow-hidden">
          {/* Header */}
          <div
            className="grid bg-[#FDF6F2] px-4 py-2.5 border-b border-[#F0DDD5]"
            style={{ gridTemplateColumns: `160px repeat(${permissions.length}, 1fr) 80px` }}
          >
            <span className="text-[11px] font-bold text-[#aaa] uppercase tracking-[0.08em] font-serif">Module</span>
            {permissions.map(p => (
              <span
                key={p._id}
                className="text-[11px] font-bold text-center capitalize tracking-[0.06em] font-serif"
                style={{
                  color: p.name === 'delete' ? '#E53935'
                    : p.name === 'create' ? '#4CAF50'
                    : p.name === 'update' ? '#FF9800'
                    : '#1565C0',
                }}
              >
                {p.name}
              </span>
            ))}
            <span className="text-[11px] font-bold text-center text-[#aaa] uppercase tracking-[0.08em] font-serif">All</span>
          </div>

          {/* Module rows */}
          {moduleList.map(mod => {
            const hasAll = permissions.length > 0 && permissions.every(p => matrix[mod].has(p._id))
            const hasAny = permissions.some(p => matrix[mod].has(p._id))
            const isCustom = customModules.includes(mod)
            return (
              <div
                key={mod}
                className={`grid items-center px-4 py-3 border-b last:border-b-0 border-[#F9F0EC] transition-colors ${hasAny ? 'bg-[#FDFAF8]' : ''}`}
                style={{ gridTemplateColumns: `160px repeat(${permissions.length}, 1fr) 80px` }}
              >
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${hasAny ? 'bg-[#C49A7A]' : 'bg-[#E0E0E0]'}`} />
                  <span className="text-[13px] capitalize font-semibold font-serif text-[#2d2d2d]">{mod}</span>
                  {isCustom && (
                    <button
                      type="button"
                      onClick={() => handleRemoveModule(mod)}
                      className="rounded-md border border-[#F5C8BC] bg-[#FFF3EE] px-2 py-0.5 text-[10px] text-[#C49A7A] font-serif cursor-pointer hover:bg-[#FDE4DA]"
                    >
                      Remove
                    </button>
                  )}
                </div>

                {permissions.map(perm => (
                  <div key={perm._id} className="flex justify-center">
                    <input
                      type="checkbox"
                      checked={matrix[mod].has(perm._id)}
                      onChange={() => togglePerm(mod, perm._id)}
                      className="w-4 h-4 cursor-pointer accent-[#C49A7A]"
                    />
                  </div>
                ))}

                <div className="flex justify-center">
                  <button
                    type="button"
                    onClick={() => toggleAllModule(mod)}
                    className={`text-[10px] px-2 py-1 rounded-md border font-serif cursor-pointer transition-all
                      ${hasAll ? 'bg-[#C49A7A] text-white border-[#C49A7A]' : 'bg-white text-[#aaa] border-[#F0DDD5] hover:border-[#C49A7A]'}`}
                  >
                    All
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="flex gap-3 pt-4 border-t border-[#F9F0EC]">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-[11px] bg-white border-2 border-[#F0DDD5] text-[#888] text-[13px] font-serif rounded-xl cursor-pointer hover:bg-[#FDF6F2] transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 py-[11px] text-white text-[13px] font-semibold font-serif rounded-xl border-none cursor-pointer hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          style={{ background: 'linear-gradient(135deg,#C49A7A,#E8B89A)' }}
        >
          {loading ? (
            <>
              <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 12a9 9 0 1 1-6.219-8.56" />
              </svg>
              {mode === 'create' ? 'Creating...' : 'Saving...'}
            </>
          ) : mode === 'create' ? '+ Create Role' : 'Save Changes'}
        </button>
      </div>
    </form>
  )
}

// Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
// Main component
// Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
const ManageRoles: React.FC = () => {
  const [roles,         setRoles]         = useState<IRole[]>([])
  const [permissions,   setPermissions]   = useState<IPermission[]>([])
  const [loading,       setLoading]       = useState(true)
  const [error,         setError]         = useState('')
  const [activeTab,     setActiveTab]     = useState<'roles' | 'permissions'>('roles')
  const [showCreate,    setShowCreate]    = useState(false)
  const [editRole,      setEditRole]      = useState<IRole | null>(null)
  const [deleteTarget,  setDeleteTarget]  = useState<{ id: string; name: string; type: 'role' | 'permission' } | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const [showPermCreate,  setShowPermCreate]  = useState(false)
  const [editPerm,        setEditPerm]        = useState<IPermission | null>(null)
  const [permForm,        setPermForm]        = useState({ name: '', description: '' })
  const [permFormLoading, setPermFormLoading] = useState(false)
  const [permFormErr,     setPermFormErr]     = useState('')

  const [toast,      setToast]      = useState<{ msg: string; type: 'success' | 'error' } | null>(null)
  const [permLookup, setPermLookup] = useState<Record<string, string>>({})
  const [rolePage, setRolePage] = useState(1)
  const [permissionPage, setPermissionPage] = useState(1)
  const [rolePageSize, setRolePageSize] = useState(DEFAULT_PAGE_SIZE)
  const [permissionPageSize, setPermissionPageSize] = useState(DEFAULT_PAGE_SIZE)
  const [rolePagination, setRolePagination] = useState<PaginationMeta>({ ...EMPTY_PAGINATION, perPage: rolePageSize })
  const [permissionPagination, setPermissionPagination] = useState<PaginationMeta>({ ...EMPTY_PAGINATION, perPage: permissionPageSize })

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const fetchAll = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [r, p] = await Promise.all([
        getAllRoles({ page: rolePage, limit: rolePageSize }),
        getAllPermissions({ page: permissionPage, limit: permissionPageSize }),
      ])
      setRoles(r.items)
      setPermissions(p.items)
      setRolePagination(r.pagination)
      setPermissionPagination(p.pagination)
      const lookup: Record<string, string> = {}
      p.items.forEach(perm => { lookup[perm._id] = perm.name })
      setPermLookup(lookup)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load')
    } finally {
      setLoading(false)
    }
  }, [permissionPage, permissionPageSize, rolePage, rolePageSize])

  useEffect(() => { fetchAll() }, [fetchAll])

  // Ã¢â€â‚¬Ã¢â€â‚¬ Role CRUD Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
  // Ã¢Å“â€¦ both handlers accept RolePayload Ã¢â‚¬â€ types align perfectly with RoleForm.onSubmit
  const handleCreateRole = async (data: RolePayload) => {
    await createRole(data)
    await fetchAll()
    setShowCreate(false)
    showToast('Role created successfully!')
  }

  const handleUpdateRole = async (data: RolePayload) => {
    if (!editRole) return
    await updateRole(editRole._id, data)
    await fetchAll()
    setEditRole(null)
    showToast('Role updated successfully!')
  }

  const handleDeleteRole = async () => {
    if (!deleteTarget) return
    setDeleteLoading(true)
    try {
      await deleteRole(deleteTarget.id)
      await fetchAll()
      setDeleteTarget(null)
      showToast('Role deleted successfully!')
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to delete', 'error')
    } finally {
      setDeleteLoading(false)
    }
  }

  // Ã¢â€â‚¬Ã¢â€â‚¬ Permission CRUD Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
  const openEditPerm = (p: IPermission) => {
    setEditPerm(p)
    setPermForm({ name: p.name, description: p.description })
    setPermFormErr('')
  }

  const handlePermSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!permForm.name.trim()) { setPermFormErr('Name is required'); return }
    setPermFormLoading(true)
    setPermFormErr('')
    try {
      if (editPerm) {
        await updatePermission(editPerm._id, { name: permForm.name.trim(), description: permForm.description.trim() })
        showToast('Permission updated!')
        setEditPerm(null)
      } else {
        await createPermission({ name: permForm.name.trim(), description: permForm.description.trim() })
        showToast('Permission created!')
        setShowPermCreate(false)
      }
      setPermForm({ name: '', description: '' })
      await fetchAll()
    } catch (err) {
      setPermFormErr(err instanceof Error ? err.message : 'Failed')
    } finally {
      setPermFormLoading(false)
    }
  }

  const handleDeletePerm = async () => {
    if (!deleteTarget) return
    setDeleteLoading(true)
    try {
      await deletePermission(deleteTarget.id)
      await fetchAll()
      setDeleteTarget(null)
      showToast('Permission deleted!')
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to delete', 'error')
    } finally {
      setDeleteLoading(false)
    }
  }

  const permInp = `w-full px-3 py-[10px] border-2 border-[#F0DDD5] rounded-[10px] text-[13px] font-serif outline-none focus:border-[#C49A7A] bg-white`

  return (
    <AdminLayout>

      {/* Toast */}
      {toast && (
        <div className={`fixed top-5 right-5 z-[500] flex items-center gap-2.5 px-5 py-3.5 rounded-xl shadow-lg text-white text-[13px] font-serif
          ${toast.type === 'success' ? 'bg-[#4CAF50]' : 'bg-[#E53935]'}`}
        >
          {toast.type === 'success'
            ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>
            : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /></svg>
          }
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[22px] font-bold text-[#2d2d2d] m-0 font-serif">Roles & Permissions</h1>
          <p className="text-[13px] text-[#aaa] mt-1 mb-0">{roles.length} roles ï¿½ {permissions.length} permissions</p>
        </div>
        <button
          onClick={() => activeTab === 'roles' ? setShowCreate(true) : setShowPermCreate(true)}
          className="flex items-center gap-2 text-white text-[13px] font-semibold font-serif px-5 py-[10px] rounded-xl border-none cursor-pointer hover:opacity-90 transition-opacity shadow-[0_4px_14px_rgba(196,154,122,0.3)]"
          style={{ background: 'linear-gradient(135deg,#C49A7A,#E8B89A)' }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Add {activeTab === 'roles' ? 'Role' : 'Permission'}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {(['roles', 'permissions'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-[10px] rounded-xl text-[13px] capitalize font-serif border-2 cursor-pointer transition-all
              ${activeTab === tab ? 'bg-[#C49A7A] text-white border-[#C49A7A]' : 'bg-white text-[#888] border-[#F0DDD5] hover:border-[#C49A7A]'}`}
          >
            {tab} ({tab === 'roles' ? roles.length : permissions.length})
          </button>
        ))}
      </div>

      {/* Loading */}
      {loading && (
        <div className="space-y-4">
          {activeTab === 'roles' ? (
            Array.from({ length: 3 }, (_, index) => (
              <div key={index} className="bg-white rounded-2xl border border-[#F0DDD5] shadow-[0_2px_12px_rgba(196,154,122,0.07)] overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-[#F9F0EC]">
                  <div className="flex items-center gap-3">
                    <SkeletonBlock className="h-10 w-10 rounded-xl" />
                    <div className="space-y-2">
                      <SkeletonBlock className="h-4 w-28" />
                      <SkeletonBlock className="h-3 w-40" />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <SkeletonBlock className="h-8 w-8" />
                    <SkeletonBlock className="h-8 w-8" />
                  </div>
                </div>
                <div className="px-6 py-4">
                  <SkeletonBlock className="h-3 w-24 mb-3" />
                  <div className="flex flex-wrap gap-2">
                    <SkeletonBlock className="h-8 w-32" />
                    <SkeletonBlock className="h-8 w-36" />
                    <SkeletonBlock className="h-8 w-28" />
                  </div>
                </div>
              </div>
            ))
          ) : (
            <TableSkeleton columns={3} rows={6} />
          )}
        </div>
      )}

      {!loading && error && (
        <div className="py-12 text-center">
          <p className="text-[13px] text-[#E53935] font-serif mb-3">{error}</p>
          <button onClick={fetchAll} className="text-[12px] text-[#C49A7A] border border-[#C49A7A] px-4 py-2 rounded-lg font-serif cursor-pointer bg-white hover:bg-[#FDF0EB] transition-colors">Retry</button>
        </div>
      )}

      {/* Ã¢â€â‚¬Ã¢â€â‚¬ ROLES TAB Ã¢â€â‚¬Ã¢â€â‚¬ */}
      {!loading && !error && activeTab === 'roles' && (
        <div className="grid grid-cols-1 gap-4">
          {roles.length === 0 && (
            <div className="bg-white rounded-2xl border border-[#F0DDD5] py-16 text-center">
              <div className="mb-3 flex justify-center text-[#C49A7A]">
                <Shield size={30} strokeWidth={1.8} />
              </div>
              <p className="text-[14px] font-bold text-[#2d2d2d] m-0 font-serif">No roles yet</p>
              <p className="text-[12px] text-[#aaa] mt-1 m-0">Click "Add Role" to create your first role</p>
            </div>
          )}
          {roles.map(role => (
            <div key={role._id} className="bg-white rounded-2xl border border-[#F0DDD5] shadow-[0_2px_12px_rgba(196,154,122,0.07)] overflow-hidden">

              {/* Role header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-[#F9F0EC]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#FDF0EB] flex items-center justify-center">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#C49A7A" strokeWidth="1.8" strokeLinecap="round">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-[15px] font-bold text-[#2d2d2d] m-0 font-serif capitalize">{role.name}</p>
                    <p className="text-[12px] text-[#aaa] m-0">{role.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => setEditRole(role)} className="w-8 h-8 rounded-lg bg-[#FDF0EB] flex items-center justify-center border-none cursor-pointer hover:bg-[#F5C8BC] transition-colors">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#C49A7A" strokeWidth="2" strokeLinecap="round">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                  </button>
                  <button onClick={() => setDeleteTarget({ id: role._id, name: role.name, type: 'role' })} className="w-8 h-8 rounded-lg bg-[#FFEBEE] flex items-center justify-center border-none cursor-pointer hover:bg-[#FFCDD2] transition-colors">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#E53935" strokeWidth="2" strokeLinecap="round">
                      <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Module access Ã¢â‚¬â€ read only */}
              {role.moduleAccess && role.moduleAccess.length > 0 && (
                <div className="px-6 py-4">
                  <p className="text-[11px] text-[#aaa] uppercase tracking-[0.08em] mb-3 font-serif">Module Access</p>
                  <div className="flex flex-wrap gap-2">
                    {role.moduleAccess.map(ma => (
                      <div key={ma.module} className="flex items-center gap-1.5 bg-[#FDF6F2] border border-[#F0DDD5] rounded-lg px-3 py-1.5">
                        <span className="text-[12px] font-bold text-[#C49A7A] capitalize font-serif">{ma.module}</span>
                        <span className="text-[#E0E0E0]">·</span>
                        <div className="flex gap-1">
                          {(ma.permission as (IPermissionRef | string)[]).map((p, i) => {
                            const name = resolvePermName(p, permLookup)
                            return (
                              <span key={i} className={`text-[10px] px-1.5 py-0.5 rounded font-semibold uppercase ${permColor(name)}`}>
                                {name}
                              </span>
                            )
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
          {rolePagination.totalItems > 0 && (
            <div className="overflow-hidden rounded-2xl border border-[#F0DDD5] bg-white">
              <Pagination
                currentPage={rolePage}
                totalPages={rolePagination.totalPages}
                totalItems={rolePagination.totalItems}
                pageSize={rolePagination.perPage}
                itemLabel="roles"
                onPageChange={setRolePage}
                onPageSizeChange={pageSize => {
                  setRolePageSize(pageSize)
                  setRolePage(1)
                }}
                pageSizeOptions={PAGE_SIZE_OPTIONS}
              />
            </div>
          )}
        </div>
      )}

      {/* Ã¢â€â‚¬Ã¢â€â‚¬ PERMISSIONS TAB Ã¢â€â‚¬Ã¢â€â‚¬ */}
      {!loading && !error && activeTab === 'permissions' && (
        <div className="bg-white rounded-2xl border border-[#F0DDD5] shadow-[0_2px_16px_rgba(196,154,122,0.08)] overflow-hidden">
          <div className="table-scroll-head grid px-6 py-3 bg-[#FDF6F2] border-b border-[#F0DDD5]" style={{ gridTemplateColumns: '1fr 2fr 100px' }}>
            {['Name', 'Description', 'Actions'].map(h => (
              <span key={h} className="text-[11px] font-bold text-[#aaa] uppercase tracking-[0.08em] font-serif">{h}</span>
            ))}
          </div>

          {permissions.length === 0 && (
            <div className="py-16 text-center">
              <div className="mb-3 flex justify-center text-[#C49A7A]">
                <KeyRound size={30} strokeWidth={1.8} />
              </div>
              <p className="text-[14px] font-bold text-[#2d2d2d] m-0 font-serif">No permissions yet</p>
            </div>
          )}

          <div className="table-scroll-area">
            {permissions.map(perm => (
              <div
                key={perm._id}
                className="grid items-center px-6 py-4 border-b border-[#F9F0EC] last:border-b-0 hover:bg-[#FDFAF8] transition-colors"
                style={{ gridTemplateColumns: '1fr 2fr 100px' }}
              >
              <div>
                <span className={`inline-block text-[12px] font-bold px-2.5 py-1 rounded-lg uppercase tracking-wide ${permColor(perm.name)}`}>
                  {perm.name}
                </span>
              </div>
              <p className="text-[13px] text-[#666] m-0 font-serif">{perm.description || '--'}</p>
              <div className="flex items-center gap-2">
                <button onClick={() => openEditPerm(perm)} className="w-8 h-8 rounded-lg bg-[#FDF0EB] flex items-center justify-center border-none cursor-pointer hover:bg-[#F5C8BC] transition-colors">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#C49A7A" strokeWidth="2" strokeLinecap="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                </button>
                <button onClick={() => setDeleteTarget({ id: perm._id, name: perm.name, type: 'permission' })} className="w-8 h-8 rounded-lg bg-[#FFEBEE] flex items-center justify-center border-none cursor-pointer hover:bg-[#FFCDD2] transition-colors">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#E53935" strokeWidth="2" strokeLinecap="round">
                    <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" />
                  </svg>
                </button>
              </div>
              </div>
            ))}
          </div>
          {permissionPagination.totalItems > 0 && (
            <Pagination
              currentPage={permissionPage}
              totalPages={permissionPagination.totalPages}
              totalItems={permissionPagination.totalItems}
              pageSize={permissionPagination.perPage}
              itemLabel="permissions"
              onPageChange={setPermissionPage}
              onPageSizeChange={pageSize => {
                setPermissionPageSize(pageSize)
                setPermissionPage(1)
              }}
              pageSizeOptions={PAGE_SIZE_OPTIONS}
            />
          )}
        </div>
      )}

      {/* Ã¢â€â‚¬Ã¢â€â‚¬ Create Role Modal Ã¢â€â‚¬Ã¢â€â‚¬ */}
      {showCreate && (
        <Modal title="Create Role" onClose={() => setShowCreate(false)} wide>
          <RoleForm mode="create" permissions={permissions} onSubmit={handleCreateRole} onCancel={() => setShowCreate(false)} />
        </Modal>
      )}

      {/* Ã¢â€â‚¬Ã¢â€â‚¬ Edit Role Modal Ã¢â€â‚¬Ã¢â€â‚¬ */}
      {editRole && (
        <Modal title="Edit Role" onClose={() => setEditRole(null)} wide>
          <RoleForm mode="edit" initial={editRole} permissions={permissions} onSubmit={handleUpdateRole} onCancel={() => setEditRole(null)} />
        </Modal>
      )}

      {/* Ã¢â€â‚¬Ã¢â€â‚¬ Create / Edit Permission Modal Ã¢â€â‚¬Ã¢â€â‚¬ */}
      {(showPermCreate || editPerm) && (
        <Modal
          title={editPerm ? 'Edit Permission' : 'Add Permission'}
          onClose={() => { setShowPermCreate(false); setEditPerm(null); setPermForm({ name: '', description: '' }) }}
        >
          <form onSubmit={handlePermSubmit} noValidate className="flex flex-col gap-4">
            {permFormErr && (
              <div className="flex items-center gap-2 bg-[#FFEBEE] border border-[#EF9A9A] rounded-xl px-4 py-3">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#E53935" strokeWidth="2" strokeLinecap="round">
                  <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" />
                </svg>
                <span className="text-[12px] text-[#E53935]">{permFormErr}</span>
              </div>
            )}
            <div>
              <label className="text-[12px] text-[#888] block mb-[5px] font-serif">Permission Name *</label>
              <input
                value={permForm.name}
                onChange={e => { setPermForm(p => ({ ...p, name: e.target.value })); setPermFormErr('') }}
                placeholder="e.g. create, read, update, delete"
                className={permInp}
              />
            </div>
            <div>
              <label className="text-[12px] text-[#888] block mb-[5px] font-serif">Description</label>
              <input
                value={permForm.description}
                onChange={e => setPermForm(p => ({ ...p, description: e.target.value }))}
                placeholder="What this permission allows..."
                className={permInp}
              />
            </div>
            <div className="flex gap-3 pt-3 border-t border-[#F9F0EC]">
              <button
                type="button"
                onClick={() => { setShowPermCreate(false); setEditPerm(null); setPermForm({ name: '', description: '' }) }}
                className="flex-1 py-[11px] bg-white border-2 border-[#F0DDD5] text-[#888] text-[13px] font-serif rounded-xl cursor-pointer hover:bg-[#FDF6F2] transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={permFormLoading}
                className="flex-1 py-[11px] text-white text-[13px] font-semibold font-serif rounded-xl border-none cursor-pointer hover:opacity-90 disabled:opacity-60 flex items-center justify-center gap-2"
                style={{ background: 'linear-gradient(135deg,#C49A7A,#E8B89A)' }}
              >
                {permFormLoading ? (
                  <>
                    <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                    </svg>
                    Saving...
                  </>
                ) : editPerm ? 'Save Changes' : '+ Add Permission'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Ã¢â€â‚¬Ã¢â€â‚¬ Delete Confirm Ã¢â€â‚¬Ã¢â€â‚¬ */}
      {deleteTarget && (
        <DeleteConfirm
          name={deleteTarget.name}
          onConfirm={deleteTarget.type === 'role' ? handleDeleteRole : handleDeletePerm}
          onCancel={() => setDeleteTarget(null)}
          loading={deleteLoading}
        />
      )}

    </AdminLayout>
  )
}

export default ManageRoles



