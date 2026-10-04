-- One Stripe event grants Verified human comms once.
create unique index if not exists saas_invoices_stripe_comms_memo_idx
  on saas_invoices (memo)
  where kind = 'stripe-comms' and memo <> '';
