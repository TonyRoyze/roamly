# Travel Buddy

A combined Next.js POC: the Travel Buddy marketplace is the main website, and the existing map, buddy profiles, package offers, and chat live at **/nearby**.

## Run

```sh
pnpm install
pnpm dev
```

Open http://localhost:3000. Choose **Nearby** in the desktop or mobile navigation, then select an existing demo user or **Explore a sample trip**. The repository’s shared header and mobile navigation connect the marketplace and map. Nearby’s own tools are tabs inside its activity panel. Switching pages keeps the selected Nearby user in this browser tab.

## Shared demo login

`/login` uses the original browser-local user picker and creation form for both apps. Existing users keep their profiles. `/login/standard` and `/register` redirect here.

| Role | Landing page |
| --- | --- |
| Traveller | `/account` |
| Local buddy | `/nearby` |
| Supplier | `/supplier` |
| Advisor | `/advisor` |
| Partner | `/partner` |
| Admin | `/admin` |

Entering from Nearby returns travellers and local buddies to the requested map tab. Portal roles open their workspace instead. All roles can edit their profile and switch users; only travellers and local buddies participate in the nearby map. Roles select demo workspaces and do not provide server-enforced authorization.

## Where things live

- `app/(marketplace)`: homepage, discovery, experience details, destinations, trips, guide demos, simulated checkout, and role portals.
- `components/marketplace` and `lib/marketplace`: imported marketplace components, catalog, and journey helpers.
- `app/nearby` and `components/nearby-experience.tsx`: the original map app. Supports `?tab=profile`, `?tab=packages`, and `?tab=messages`.
- `app/marketplace.css`: marketplace styles scoped to `.marketplace`.
- `app/globals.css`: shared theme and map styles scoped to `.nearby-app`, with styles for portaled sheets.

The marketplace UI was adapted from [Kasun-Vishvajith/TravelBuddy](https://github.com/Kasun-Vishvajith/TravelBuddy), commit `030fb0393aad557e636345781c8b5537294af456`. Its Next.js 14 route parameters were migrated to this project's async Next.js route APIs. The source repository's database schema and environment configuration were not copied.

Both experiences retain their POC storage: marketplace trips/cart use `tb-*` local-storage keys; Nearby users, plans, offers, and messages use the existing `roamly-poc-*` keys. Marketplace roles, guide sessions, payments, and booking endpoints are simulations. This integration does not add production authentication, shared server persistence, or real payments.

## Checks

```sh
pnpm exec tsc --noEmit
pnpm build
```
