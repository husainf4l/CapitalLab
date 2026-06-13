# Capital Lab — Admin & Branch Manager Guide
## Operations Management · v1.0

---

## Your Role

As a BranchAdmin or LabManager, you are responsible for:
- Daily operational oversight
- Inventory management
- Billing and collections
- Insurance claim management
- Staff management
- Audit and compliance
- System configuration

---

## 1. Login

1. Go to the Capital Lab URL → **"Login"**
2. Enter your email and password
3. Navigate to **Admin Dashboard** (`/admin`)

---

## 2. Navigation

**Admin Sidebar:**
- **Inventory** — Stock levels, low alerts, purchase orders
- **Purchase Orders** — Procurement workflow
- **Billing** — Invoice management and payment tracking
- **Payments** — Payment records
- **Insurance** — Claims management
- **Notifications** — System notification center
- **Audit Center** — Full activity log
- **Analyzers** — Register and import from analyzers
- **Settings** — System configuration
- **System Health** — Infrastructure status

---

## 3. Inventory Management

### Daily Inventory Check
1. Go to **Admin → Inventory**
2. Review items with **Low Stock** badges (yellow/red)
3. Check items with **Near Expiry** warnings (30/60/90 days)
4. Create purchase orders for items below minimum stock

### Creating a Purchase Order
1. **Admin → Purchase Orders** → **"New Purchase Order"**
2. Select the supplier
3. Add items with quantities needed
4. Submit for approval (if required by your lab policy)
5. When order is received, mark items as received — stock is updated automatically

### Setting Minimum Stock Levels
1. **Inventory** → click on any item
2. Set the **Minimum Stock Alert Level** for your branch
3. System will alert you when actual stock falls below this level

### Handling Expiry
- Items within 30 days of expiry are highlighted in **orange**
- Items within 7 days are highlighted in **red**
- Review and plan consumption or disposal
- Log disposal if items must be discarded

---

## 4. Billing and Collections

### Invoice Overview
1. Go to **Admin → Billing**
2. View all invoices by status: Issued / Paid / Partially Paid / Overdue / Cancelled

### Tracking Unpaid Invoices
1. Filter by status **"Issued"** (unpaid)
2. Sort by **Due Date** to see overdue invoices
3. Contact patients with overdue balances
4. Record any payment when received

### Monthly Revenue Review
1. **Billing** → filter by current month
2. Note: Total Invoiced, Total Collected, Outstanding
3. This data feeds into the Owner analytics dashboard

---

## 5. Insurance Claims

### Claim Workflow
1. **Admin → Insurance**
2. All claims are listed with status: Pending / Submitted / Under Review / Approved / Rejected

### Submitting a Claim
1. Click on a Pending claim
2. Review the details: patient, tests, amounts
3. Click **"Submit Claim"**
4. Enter any authorization number or reference number from the insurance company
5. Status moves to **Submitted**

### Handling Rejections
1. Filter by status **"Rejected"**
2. Click on the claim to see the rejection reason
3. Correct the issue (wrong code, missing information, etc.)
4. Click **"Resubmit"**
5. Track status until Approved

### Key Rules for Clean Claims
- Always enter insurance authorization number (if required)
- Verify patient insurance details before creating the order
- Ensure test codes match the insurance company's accepted codes

---

## 6. Notification Center

### Sending a Notification
1. **Admin → Notifications**
2. Click **"Send Test Notification"**
3. Select recipient (user ID)
4. Select channel: In-App, Email, SMS, WhatsApp, Push
5. Enter title and message
6. Click **"Send"**

### Viewing Notification History
- The notification list shows all sent notifications
- Status: Pending / Sent / Failed
- Click any notification to see delivery log

---

## 7. Audit Center

The Audit Center logs every action in the system — who did what, when, and from where.

### Viewing the Audit Log
1. **Admin → Audit Center**
2. All actions are listed chronologically
3. Each entry shows: Time, User, Action, Entity, IP Address

### Filtering
- By **Entity Type** — e.g., "Invoice", "Sample", "Patient"
- By **Action** — Create / Update / Delete / Login
- By **Date Range** — From and To
- By **User** — Find all actions by a specific staff member

### Investigating an Issue
Example: A patient says their invoice was changed
1. Filter by Entity Type = **Invoice**, Action = **Update**
2. Filter by date range around the reported time
3. Click the entry to see **Old Values** and **New Values** (JSON diff)
4. This shows exactly what changed and who made the change

---

## 8. Analyzer Management

### Registering a New Analyzer
1. **Admin → Analyzers** → **"Add Analyzer"**
2. Enter: Name, Manufacturer, Model, Serial Number, Branch
3. Save

### Importing Analyzer Results
1. **Admin → Analyzers** → **"Import Data"**
2. Select the analyzer
3. Select format (CSV / HL7 / ASTM / XML)
4. Paste or upload the content
5. Review the import result (processed / failed / errors)

---

## 9. System Settings

### Configuring Settings
1. **Admin → Settings**
2. Settings are grouped by category: General, Email, SMS, Notifications, PDF, Branding
3. Click the pencil icon to edit any value
4. Press Enter or click the checkmark to save

### Key Settings to Configure
| Category | Setting | Example |
|---|---|---|
| General | Lab Name | Capital Lab — Abdali |
| General | Default Currency | JD |
| Email | SMTP Host | smtp.mailgun.org |
| Notifications | WhatsApp API Key | [Your API key] |
| PDF | Logo URL | https://... |
| Branding | Primary Color | #1d4ed8 |

---

## 10. Best Practices

- **Audit regularly** — review the audit log weekly for unexpected actions
- **Inventory check every Monday** — catch low stock before the week gets busy
- **Insurance claims** — review rejected claims weekly; aging claims lose value
- **Backup** — confirm backup is running (check with Capital Lab support)

---

## 11. Troubleshooting

| Problem | Solution |
|---|---|
| Inventory count doesn't match physical | Audit the log for unexpected changes; do a physical recount |
| Insurance claim stuck in Pending | Check if submission was actually sent; verify internet connectivity |
| Notification not delivered | Check notification logs for failure reason; verify API key in settings |
| Staff cannot log in | Reset their password in Settings → Staff |
