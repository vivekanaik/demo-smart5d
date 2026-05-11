import sys

content = open('app/chef/page.tsx').read()

replacements = [
    ('subtitle="Chef Console"', 'subtitle={t.dashboardTitle}'),
    ('"Hotel Analytics"', 't.hotelAnalytics'),
    ('label: "ALL"', 'label: t.tabAll'),
    ('label: "ACTIVE ORDER"', 'label: t.tabActive'),
    ('label: "PREVIOUS ORDER"', 'label: t.tabPrevious'),
    ('label: "CANCELLED ORDER"', 'label: t.tabCancelled'),
    ('Orders\n            </button>', '{t.btnOrders}\n            </button>'),
    ('Analytics\n            </button>', '{t.btnAnalytics}\n            </button>'),
    ('Queue #', '{t.queue}'),
    ('Table</p>', '{t.table}</p>'),
    ('Guest: <span', '{t.guest} <span'),
    ('Table Seated: <span', '{t.tableSeated} <span'),
    ('Subtotal: <span', '{t.subtotal} <span'),
    ('Total Bill: <span', '{t.totalBill} <span'),
    ('Note: {order.generalNote}', '{t.note} {order.generalNote}'),
    ('Order Items</p>', '{t.orderItems}</p>'),
    ('All Served\n', '{t.allServed}\n'),
    ('Close Table\n', '{t.closeTable}\n'),
    ('Cancel Table\n', '{t.cancelTable}\n'),
    ('No active orders in queue.', '{t.noActiveOrders}'),
    ('Previous Orders\n', '{t.ordersHeadingPrevious}\n'),
    ('No completed orders yet.', '{t.noCompletedOrders}'),
    ('Restore\n', '{t.restore}\n'),
    ('Completed at {', '{t.completedAt} {'),
    ('Cancelled Orders\n', '{t.ordersHeadingCancelled}\n'),
    ('No cancelled orders.', '{t.noCancelledOrders}'),
    ('Cancelled at {', '{t.cancelledAt} {'),
    ('>Revenue</p>', '>{t.revenue}</p>'),
    ('>Completed Orders</p>', '>{t.completedOrdersAnalytics}</p>'),
    ('>Cancelled Orders</p>', '>{t.cancelledOrdersAnalytics}</p>'),
    ('>Avg Prep Time</p>', '>{t.avgPrepTime}</p>'),
    ('>Occupancy Rate</p>', '>{t.occupancyRate}</p>'),
    ('>Most Ordered</p>', '>{t.mostOrdered}</p>'),
    ('>Performance Note</p>', '>{t.performanceNote}</p>'),
    ('Checkout Table {', '{t.checkoutTable} {'),
    ('WhatsApp\n', '{t.whatsapp}\n'),
    ('Email\n', '{t.email}\n'),
    ('Cash/Card\n', '{t.cashCard}\n'),
    ('WhatsApp Number\n', '{t.whatsappNumber}\n'),
    ('Send Bill & Close Table\n', '{t.sendBillClose}\n'),
    ('Email Address\n', '{t.emailAddress}\n'),
    ('Send Receipt & Close Table\n', '{t.sendReceiptClose}\n'),
    ('Mark as Paid & Close Table\n', '{t.markAsPaidClose}\n'),
    ('                      {window}\n                    </button>', '                      {t[window as keyof typeof t]}\n                    </button>'),
]

for old, new in replacements:
    content = content.replace(old, new)

# Perf string replace:
perf_old = """? "Today shows healthy throughput with low cancellation rate. Monitor prep times for table clusters during peak lunch windows."
                    : analyticsWindow === "weekly"
                      ? "Weekly trend is stable with strong occupancy. Focus on staffing balance for weekend evening rush to reduce prep delay."
                      : analyticsWindow === "monthly"
                        ? "Monthly numbers indicate sustained demand. Consider optimizing inventory for best-selling dishes to avoid stockouts."
                        : "Yearly data reflects strong retention and high service consistency. Continue tracking prep-time outliers across seasonal peaks."}"""

perf_new = """? t.perfDaily
                    : analyticsWindow === "weekly"
                      ? t.perfWeekly
                      : analyticsWindow === "monthly"
                        ? t.perfMonthly
                        : t.perfYearly}"""

content = content.replace(perf_old, perf_new)

open('app/chef/page.tsx', 'w').write(content)

