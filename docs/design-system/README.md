# Howtoprompt Main UI Pilot 1

Pilot 1 khoa baseline UI cho `howtoprompt-main` theo huong `startup-polished`.
Bo artifact nay dung de:

- inventory hoa UI hien tai truoc khi refactor;
- khoa token hierarchy de stop viec them mau / radius / shadow linh tinh;
- chot approved component catalog v1 de team tai su dung truoc khi viet moi;
- chot page pattern map de moi feature moi phai map vao mot pattern ro rang.

## Artifact

- [UI inventory](./UI_INVENTORY.md)
- [Token map](./TOKEN_MAP.md)
- [Approved component catalog v1](./APPROVED_COMPONENT_CATALOG_V1.md)
- [Page pattern map](./PAGE_PATTERN_MAP.md)

## Cach dung trong feature moi

1. Xac dinh feature moi thuoc page pattern nao trong `PAGE_PATTERN_MAP.md`.
2. Chon component tu `APPROVED_COMPONENT_CATALOG_V1.md`.
3. Neu can style moi, check `TOKEN_MAP.md` truoc. Khong tao raw color, raw shadow, raw radius moi ngay trong page.
4. Neu khong co component phu hop, mo mot `catalog gap` va extract thanh component bridge truoc, khong patch tam bang class local.

## Guardrails cho pilot nay

- Moi page moi phai di qua `AppShell` va `page-frame`.
- Khong tao them visual family moi ngoai `startup-polished`.
- Khong viet them page-level layout theo kieu freeform neu da co pattern tuong duong.
- Khong them variant button, card, form field moi neu chua co ten trong catalog.
- `ProgressRail` dang la component co san nhung chua mounted; khong tai su dung lung tung truoc khi chot vi tri trong shell.

## Muc tieu sau Pilot 1

- Tach dan bridge primitives ra khoi `globals.css`.
- Dong goi lai cac workbench lon thanh `page composites` co API ro rang.
- Bien tai lieu nay thanh contract cho Pilot 2 va Pilot 3 trong portfolio.
