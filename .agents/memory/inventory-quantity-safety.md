---
name: Inventory quantity safety
description: Durable rule for keeping product-card and popup quantities aligned with live inventory.
---

If a product-size row is missing from the live inventory response, treat that variant as unavailable rather than unlimited. Quantity controls must remain isolated by UI surface, clamp to the confirmed stock for the selected size, and block add-to-cart until stock is loaded and validated.

**Why:** A missing product-size match previously fell through to a null stock value, allowing the quantity stepper to increase without a limit and creating a mismatch with the inventory system.

**How to apply:** Use separate local quantity state for cards and detail popups; key popup quantities by package-size label; fail closed for missing or not-yet-loaded stock; validate again when adding to cart.