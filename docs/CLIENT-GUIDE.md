# Running the shop

A non-technical guide to the admin portal.

> **This is a development build.** Data resets when the server restarts, and no
> real payments are taken. Everything below is how it will work once live.

## Getting in

The admin portal runs at **http://localhost:3001** while in development.

There is no login yet — it is being built. Once live you will sign in with your
email address and a code from your phone.

## The dashboard

The first page shows the day at a glance:

- **Orders today** and revenue
- **This month** running total
- **Awaiting fulfilment** — orders you need to act on
- **Low stock** — items with three or fewer left

Below that: your most recent orders, and a list of what needs restocking.

If **Awaiting fulfilment** is climbing and you have not been packing, that is
the number to watch.

## Handling an order

1. Open **Orders** in the sidebar.
2. Click an order number to open it.
3. You see everything: what was bought, who bought it, where it goes, how they
   paid.
4. Use the **Update status** buttons to move it along:

   **Paid → Confirmed → Packed → Shipped → Delivered**

Only the valid next steps are shown. You cannot accidentally mark a cancelled
order as delivered — the system will not let you, on purpose.

Once the courier integration is connected, marking an order **Shipped** will
automatically book the pickup and produce the shipping label.

### Cancelling or refunding

**Cancel** is available up to the point an order ships. **Refund** is available
on paid orders. Both are permanent — there is no undo.

## Marking something out of stock

This is the most common task.

1. Open **Inventory**.
2. Find the item — search by product name, colour, or SKU.
3. Two things you can change:
   - **The stock number.** Click it, type the new figure, press Enter.
   - **Visible / Hidden.** Click the badge to flip it. Hidden means it stops
     showing on the website even if stock remains — useful for a piece you are
     holding back or a photo you are not happy with.

Setting stock to **0** automatically marks it sold out. The website updates
within seconds.

### Updating many at once

If you have counted the shop and need to update fifty items:

1. Click **Bulk update**.
2. Paste one line per item: the SKU, a comma, the new number.

   ```
   BE-EMBROI-DEE-M,12
   BE-EMBROI-DEE-L,0
   BE-DESIGN-BLU-S,5
   ```

3. Click **Apply**.

If any line has a mistake — a wrong SKU, a number that is not a number —
**nothing is changed at all** and you are told which lines to fix. This is
deliberate: a half-applied stock update is worse than none.

## The other pages

| Page | What it is for |
| --- | --- |
| **Products** | The full catalogue with prices and total stock. Editing forms are still being built — stock changes happen in Inventory. |
| **Customers** | Who has bought, how often, how much |
| **Coupons** | Discount codes, how many times each has been used, whether it is still live |
| **Reports** | Best sellers, average order value, share of cash-on-delivery orders |

## Things worth knowing

**Prices include GST.** The price you enter is the price the customer pays.
The tax breakdown shown on the invoice is calculated from it, not added to it.

**Free shipping over ₹1,999.** Below that it is ₹99. Cash on delivery adds ₹50.

**Order history never changes.** If you edit a product's name or price, orders
already placed keep the details as they were at the time of purchase. Your
records stay accurate.

**Customer details are private.** The admin portal holds names, addresses and
phone numbers. Do not share the login, and do not leave it open on a shared
computer.

## When something looks wrong

- **An order is stuck on "Paid" and never became "Confirmed".** Payment
  succeeded but something after it did not. Do not re-charge the customer —
  check with your developer first.
- **Stock looks wrong on the website.** Check the Inventory page first; that is
  the source of truth. If they disagree, tell your developer.
- **A customer says they paid but has no order.** Get the order number from
  their confirmation email or their payment reference, and check Orders. If
  there is genuinely no order but money left their account, that is a payment
  gateway issue — escalate, do not refund manually.

For anything else, contact your developer with the **order number** and what
you expected to see. That is almost always enough to diagnose it.
