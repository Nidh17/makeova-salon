import React, { useEffect, useMemo, useState } from 'react'
import AdminLayout from './AdminLayout'
import { getAllAppointments, type IAppointment } from '@/api/AppointmentsApi'
import { getAllUsers } from '@/api/Userapi'
import { getAllServices, type IService } from '@/api/services/servicesApi'
import type { IUser } from '@/types'

type ReportMetric = 'revenue' | 'bookings'

interface MonthlyPoint {
  month: string
  revenue: number
  bookings: number
}

interface SummaryCard {
  label: string
  value: string
  change: string
  up: boolean
}

interface ServicePerformance {
  name: string
  bookings: number
  revenue: number
  pct: number
}

const formatCurrency = (value: number) => `Rs ${value.toLocaleString('en-IN')}`

const formatChange = (value: number) => `${value >= 0 ? '+' : ''}${Math.round(value)}%`

const getMonthKey = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`

const getRoleCount = (users: IUser[], roleName: string) =>
  users.filter(user => user.role.some(role => role.name?.toLowerCase() === roleName)).length

const getPctChange = (current: number, previous: number) => {
  if (previous === 0) return current > 0 ? 100 : 0
  return ((current - previous) / previous) * 100
}

const Reports: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ReportMetric>('revenue')
  const [appointments, setAppointments] = useState<IAppointment[]>([])
  const [services, setServices] = useState<IService[]>([])
  const [customerCount, setCustomerCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadReports = async () => {
      try {
        setLoading(true)
        setError('')

        const [appointmentData, serviceData, users] = await Promise.all([
          getAllAppointments({ page: 1, limit: 10 }),
          getAllServices({ page: 1, limit: 10 }),
          getAllUsers({ page: 1, limit: 10}),
        ])

        setAppointments(appointmentData.items)
        setServices(serviceData.items)
        setCustomerCount(getRoleCount(users.items, 'customer'))
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load reports')
      } finally {
        setLoading(false)
      }
    }

    loadReports()
  }, [])

  const reports = useMemo(() => {
    const now = new Date()
    const currentMonthKey = getMonthKey(now)
    const previousMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const previousMonthKey = getMonthKey(previousMonthDate)

    const monthBuckets = Array.from({ length: 6 }, (_, index) => {
      const date = new Date(now.getFullYear(), now.getMonth() - (5 - index), 1)
      return {
        key: getMonthKey(date),
        month: date.toLocaleDateString('en-US', { month: 'short' }),
        revenue: 0,
        bookings: 0,
      }
    })

    const bucketMap = new Map(monthBuckets.map(item => [item.key, item]))
    const serviceLookup = new Map(services.map(service => [service._id, service]))
    const servicePerformance = new Map<string, { name: string; bookings: number; revenue: number }>()

    let currentMonthRevenue = 0
    let previousMonthRevenue = 0
    let currentMonthBookings = 0
    let previousMonthBookings = 0

    appointments.forEach(appointment => {
      const appointmentDate = new Date(appointment.appointmentDate)
      if (Number.isNaN(appointmentDate.getTime())) return

      const monthKey = getMonthKey(appointmentDate)
      const bucket = bucketMap.get(monthKey)
      if (bucket) {
        bucket.bookings += 1
        if (appointment.status === 'completed') {
          bucket.revenue += appointment.totalPrice
        }
      }

      if (monthKey === currentMonthKey) {
        currentMonthBookings += 1
        if (appointment.status === 'completed') currentMonthRevenue += appointment.totalPrice
      }

      if (monthKey === previousMonthKey) {
        previousMonthBookings += 1
        if (appointment.status === 'completed') previousMonthRevenue += appointment.totalPrice
      }

      const serviceId = typeof appointment.services === 'string' ? appointment.services : appointment.services?._id
      const serviceName =
        typeof appointment.services === 'string'
          ? serviceLookup.get(appointment.services)?.name || 'Service'
          : appointment.services?.name || 'Service'

      if (!serviceId) return

      const entry = servicePerformance.get(serviceId) || { name: serviceName, bookings: 0, revenue: 0 }
      entry.bookings += 1
      if (appointment.status === 'completed') {
        entry.revenue += appointment.totalPrice
      }
      servicePerformance.set(serviceId, entry)
    })

    const topBookingCount = Math.max(...Array.from(servicePerformance.values()).map(item => item.bookings), 0)
    const topServices: ServicePerformance[] = Array.from(servicePerformance.values())
      .sort((a, b) => {
        if (b.bookings !== a.bookings) return b.bookings - a.bookings
        return b.revenue - a.revenue
      })
      .slice(0, 5)
      .map(item => ({
        ...item,
        pct: topBookingCount > 0 ? Math.max(12, Math.round((item.bookings / topBookingCount) * 100)) : 0,
      }))

    const completedAppointments = appointments.filter(appointment => appointment.status === 'completed')
    const averagePerBooking = completedAppointments.length
      ? Math.round(completedAppointments.reduce((sum, appointment) => sum + appointment.totalPrice, 0) / completedAppointments.length)
      : 0

    const summaryCards: SummaryCard[] = [
      {
        label: 'This Month Revenue',
        value: formatCurrency(currentMonthRevenue),
        change: formatChange(getPctChange(currentMonthRevenue, previousMonthRevenue)),
        up: currentMonthRevenue >= previousMonthRevenue,
      },
      {
        label: 'This Month Bookings',
        value: currentMonthBookings.toString(),
        change: formatChange(getPctChange(currentMonthBookings, previousMonthBookings)),
        up: currentMonthBookings >= previousMonthBookings,
      },
      {
        label: 'Avg. Per Completed Booking',
        value: formatCurrency(averagePerBooking),
        change: `${completedAppointments.length} completed`,
        up: true,
      },
      {
        label: 'Total Customers',
        value: customerCount.toString(),
        change: `${services.filter(service => service.isActive).length} active services`,
        up: true,
      },
    ]

    return {
      monthlyData: monthBuckets as MonthlyPoint[],
      summaryCards,
      topServices,
      maxVal: Math.max(...monthBuckets.map(item => (activeTab === 'revenue' ? item.revenue : item.bookings)), 0),
      totals: {
        appointments: appointments.length,
        completed: completedAppointments.length,
        services: services.length,
      },
    }
  }, [activeTab, appointments, customerCount, services])

  if (loading) {
    return (
      <AdminLayout>
        <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
          <div className="w-10 h-10 rounded-full border-[3px] border-[#F0DDD5] border-t-[#C49A7A] animate-spin" />
          <p className="text-[13px] text-[#aaa] font-serif">Loading reports...</p>
        </div>
      </AdminLayout>
    )
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
          <p className="text-[13px] text-[#E53935] font-serif">{error}</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="text-[12px] text-[#C49A7A] border border-[#C49A7A] px-4 py-2 rounded-lg font-serif cursor-pointer bg-white hover:bg-[#FDF0EB] transition-colors"
          >
            Retry
          </button>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#2d2d2d', margin: 0, fontFamily: "'Georgia',serif" }}>Reports</h1>
        <p style={{ fontSize: 13, color: '#aaa', marginTop: 4, marginBottom: 0 }}>
          Live business insights from appointments, customers, and service performance
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 18, marginBottom: 28 }}>
        {reports.summaryCards.map(({ label, value, change, up }) => (
          <div
            key={label}
            style={{
              background: 'white',
              borderRadius: 8,
              padding: '22px 24px',
              border: '1px solid #F0DDD5',
              boxShadow: '0 2px 12px rgba(196,154,122,0.07)',
            }}
          >
            <p style={{ fontSize: 12, color: '#aaa', margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'sans-serif' }}>
              {label}
            </p>
            <p style={{ fontSize: 26, fontWeight: 700, color: '#2d2d2d', margin: '0 0 6px', fontFamily: "'Georgia',serif" }}>{value}</p>
            <span style={{ fontSize: 12, color: up ? '#4CAF50' : '#E53935', fontWeight: 600 }}>{change}</span>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20, marginBottom: 28 }}>
        <div
          style={{
            background: 'white',
            borderRadius: 8,
            border: '1px solid #F0DDD5',
            padding: '24px',
            boxShadow: '0 2px 12px rgba(196,154,122,0.06)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
            <div>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: '#2d2d2d', margin: 0, fontFamily: "'Georgia',serif" }}>Monthly Overview</h3>
              <p style={{ fontSize: 12, color: '#8D7B70', margin: '6px 0 0', fontFamily: "'Georgia',serif" }}>
                Last 6 months performance based on live appointment data
              </p>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              {(['revenue', 'bookings'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  style={{
                    background: activeTab === tab ? '#C49A7A' : '#F9F0EC',
                    color: activeTab === tab ? 'white' : '#888',
                    border: 'none',
                    padding: '6px 16px',
                    borderRadius: 6,
                    fontSize: 12,
                    cursor: 'pointer',
                    fontFamily: "'Georgia',serif",
                    textTransform: 'capitalize',
                  }}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 16, height: 180 }}>
            {reports.monthlyData.map(point => {
              const value = activeTab === 'revenue' ? point.revenue : point.bookings
              const height = reports.maxVal > 0 ? Math.max(10, Math.round((value / reports.maxVal) * 150)) : 10
              return (
                <div key={point.month} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 10, color: '#C49A7A', fontWeight: 600 }}>
                    {activeTab === 'revenue' ? formatCurrency(value) : value}
                  </span>
                  <div
                    style={{
                      width: '100%',
                      height,
                      background: 'linear-gradient(180deg, #C49A7A 0%, #F5C8BC 100%)',
                      borderRadius: '6px 6px 0 0',
                      transition: 'height 0.4s ease',
                    }}
                  />
                  <span style={{ fontSize: 11, color: '#aaa', fontFamily: 'sans-serif' }}>{point.month}</span>
                </div>
              )
            })}
          </div>
        </div>

        <div
          style={{
            background: 'white',
            borderRadius: 8,
            border: '1px solid #F0DDD5',
            padding: '24px',
            boxShadow: '0 2px 12px rgba(196,154,122,0.06)',
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
          }}
        >
          <h3 style={{ fontSize: 15, fontWeight: 700, color: '#2d2d2d', margin: 0, fontFamily: "'Georgia',serif" }}>Snapshot</h3>
          {[
            { label: 'Total Appointments', value: reports.totals.appointments, tone: '#C49A7A', bg: '#FDF0EB' },
            { label: 'Completed Appointments', value: reports.totals.completed, tone: '#1565C0', bg: '#E3F2FD' },
            { label: 'Services Listed', value: reports.totals.services, tone: '#4CAF50', bg: '#E8F5E9' },
          ].map(item => (
            <div key={item.label} style={{ padding: '16px', borderRadius: 8, background: item.bg }}>
              <p style={{ margin: '0 0 6px', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#8D7B70' }}>{item.label}</p>
              <p style={{ margin: 0, fontSize: 24, fontWeight: 700, color: item.tone, fontFamily: "'Georgia',serif" }}>{item.value}</p>
            </div>
          ))}
        </div>
      </div>

      <div style={{ background: 'white', borderRadius: 8, border: '1px solid #F0DDD5', padding: '24px', boxShadow: '0 2px 12px rgba(196,154,122,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: '#2d2d2d', margin: 0, fontFamily: "'Georgia',serif" }}>Top Services</h3>
            <p style={{ fontSize: 12, color: '#8D7B70', margin: '6px 0 0', fontFamily: "'Georgia',serif" }}>
              Ranked by booking volume, with completed revenue contribution
            </p>
          </div>
        </div>

        {reports.topServices.length === 0 ? (
          <div style={{ padding: '24px 0', textAlign: 'center', fontSize: 13, color: '#aaa', fontFamily: "'Georgia',serif" }}>
            No service performance data available yet.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {reports.topServices.map(({ name, bookings, revenue, pct }) => (
              <div key={name}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, gap: 16 }}>
                  <span style={{ fontSize: 13, color: '#2d2d2d', fontFamily: "'Georgia',serif" }}>{name}</span>
                  <div style={{ display: 'flex', gap: 20 }}>
                    <span style={{ fontSize: 12, color: '#aaa' }}>{bookings} bookings</span>
                    <span style={{ fontSize: 12, color: '#C49A7A', fontWeight: 600 }}>{formatCurrency(revenue)}</span>
                  </div>
                </div>
                <div style={{ height: 6, background: '#F9F0EC', borderRadius: 4, overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%',
                      width: `${pct}%`,
                      background: 'linear-gradient(90deg, #C49A7A, #F5C8BC)',
                      borderRadius: 4,
                      transition: 'width 0.6s ease',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  )
}

export default Reports
