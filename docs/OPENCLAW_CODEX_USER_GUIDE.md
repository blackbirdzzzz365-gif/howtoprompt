# OpenClaw x Codex Operator Playbook

Cập nhật lần cuối: `2026-03-31 23:59:00 +07`

Đây là tài liệu source of truth hiện tại để dùng OpenClaw và Codex hiệu quả về sau.

Nếu tài liệu cũ trong thư mục này nói khác tài liệu này, hãy ưu tiên tài liệu này.

Mục tiêu của playbook này không phải chỉ dạy bạn “prompt sao cho hay”. Mục tiêu là dạy bạn điều khiển **một vòng phát triển sản phẩm thật**:

1. chạy production audit bằng case thật
2. dừng ở checkpoint verdict
3. bạn chốt hướng
4. Codex thực thi phase
5. bạn quyết định merge/deploy hay replay thêm
6. quay lại production để revalidate

## 1. Giải thích kiểu Feynman: hãy nghĩ như đang chơi game chiến thuật

Hệ thống này dễ hiểu nhất nếu bạn nghĩ nó là một game có 5 vai:

- bạn là `owner`
- mỗi `section/topic Telegram` là một bàn chơi
- OpenClaw bot là `người điều phối`
- Codex là `worker kỹ thuật`
- repo + production là `thế giới thật`

Nếu nhớ đúng 4 câu này, bạn sẽ ít dùng sai hệ thống:

1. `Một section nên giữ một issue chính`.
2. `Một prompt nên đi qua một gate chính`.
3. `OpenClaw phù hợp khi bạn muốn bot-side delegation có memory và resume`.
4. `Codex trực tiếp phù hợp khi bạn đang ở IDE và muốn cộng tác sát từng bước`.

## 2. Board thật đang chạy như thế nào

Tính đến ngày `2026-03-31`, runtime đã verify như sau:

- runtime OpenClaw x Codex thật đang chạy trên `linuxvm (openclawlinus)`
- `chiasegpu-vm` không phải runtime OpenClaw x Codex chính
- các bot Linux-side đang dùng được Codex:
  - `linux_main`
  - `lavis_linux`
  - `gaubot`

Luồng thật hiện tại là:

```text
owner
-> Telegram section
-> OpenClaw bot
-> codex-telegram-dispatch
-> codex-ticket
-> codex-supervisor
-> Codex CLI
-> repo/worktree
-> artifacts + summary tro lai bot
```

Những gì đã verify trên Linux VM:

- `codex`, `repo-path`, `codex-ticket`, `codex-dispatch`, `codex-telegram-dispatch` đều gọi được
- cả 3 bot `linux_main`, `lavis_linux`, `gaubot` đều dispatch được sang Codex
- bundle skill cho `social-listening-v3` đã sync xong và bot gọi được
- absolute path kiểu `/Users/nguyenquocthong/...` đã được map tương thích trên Linux để Codex skills resolve đúng

## 3. Hai chế độ điều khiển bạn nên dùng

### 3.1. Dùng OpenClaw khi nào

Dùng OpenClaw khi bạn muốn:

- làm việc từ Telegram
- có `persistent ticket`
- có `CONTEXT-<ticket>.md`
- để bot tự loop thêm vài turn với Codex
- để cuộc việc có thể resume sau

OpenClaw là lựa chọn tốt nhất khi bạn đang điều phối:

- production audit
- deploy gate
- revalidation
- asynchronous follow-up

### 3.2. Dùng Codex trực tiếp khi nào

Dùng Codex trực tiếp khi bạn:

- đang ngồi trong IDE
- muốn thảo luận sát codebase
- muốn xem/sửa file ngay
- muốn phản biện hoặc chốt solution nhanh

Codex trực tiếp là lựa chọn tốt khi bạn đang:

- đọc code
- sửa docs
- làm implementation sâu
- review output trước khi giao lại cho bot

## 4. Ba class bot nên nhớ

### `linux_main`

Hợp với:

- runtime
- production audit
- deploy gate
- revalidation
- integration proof

### `lavis_linux`

Hợp với:

- phân tích
- root cause
- review
- specification
- challenge contained-fix vs new-phase

### `gaubot`

Hợp với:

- implementation
- phase executor
- branch/docs/checkpoints/code
- validation trước candidate summary

Ba bot đều có cùng contract gọi Codex, nhưng khác nhau ở “phong cách và điểm rơi tốt nhất”.

## 5. Luật chơi quan trọng nhất: một prompt, một gate

Đây là nguyên tắc quan trọng nhất của workflow mới.

Không nên trộn các gate sau trong cùng một prompt:

- `production audit`
- `direction lock`
- `phase execution`
- `merge/deploy`
- `revalidation`

Ví dụ xấu:

```text
@linux_mainbot hay tro chuyen voi codex va audit phase nay, neu thay loi thi pull main, tao branch, code fix, merge va deploy luon.
```

Vì prompt này:

- làm mất checkpoint verdict
- làm mất human gate 1
- làm mất human gate 2
- khiến bot phải đoán điểm dừng

Ví dụ đúng:

```text
@linux_mainbot hay tro chuyen voi codex va dung skill social-listening-v3-production-audit.
Repo: social-listening-v3
Muc tieu: chay live case pack va tao checkpoint verdict.
Rule: dung o checkpoint verdict, chua implement.
```

## 6. Vòng phát triển sản phẩm chuẩn

### Turn 1: Production Raid

Mục tiêu:

- chạy case pack thật
- lấy live data, logs, report
- đối chiếu với phase hiện tại
- tạo `checkpoint verdict`

Điểm dừng đúng:

- `checkpoint verdict`

Skill repo-local:

- `social-listening-v3-production-audit`

Bot phù hợp:

- `linux_main`

### Human Gate 1: Direction Lock

Sau checkpoint verdict, bạn phải chốt một trong hai hướng:

- `Chot huong: contained-fix.`
- `Chot huong: new-phase.`

Không nên nói mơ hồ kiểu:

```text
fix tiep di
```

Vì agent sẽ không biết:

- còn ở phase cũ hay đã mở phase mới
- có cần docs/checkpoint package mới hay không
- có được vào implementation machine hay chưa

### Turn 2: Phase Executor

Sau khi bạn chốt hướng, agent mới được:

- lấy code mới nhất từ `main`
- tạo branch mới
- đóng gói docs phase
- phân tích technical delta
- break checkpoints
- implement
- validate
- tạo `candidate summary`

Điểm dừng đúng:

- `candidate summary`

Skill repo-local:

- `social-listening-v3-phase-executor`

Bot phù hợp:

- `gaubot`

### Human Gate 2: Merge Or Replay

Sau candidate summary, bạn quyết định:

- merge/deploy
- hoặc brainstorm thêm và replay thêm một vòng

Không nên xem `candidate summary` là lệnh merge.

`candidate summary` chỉ là input để bạn quyết định Gate 2.

### Turn 3: Revalidate

Sau deploy, quay lại:

- production audit
- chạy lại case quan trọng
- so trước/sau
- xác nhận phase vừa ship có thực sự tạo outcome không

Nếu chưa, vòng lặp bắt đầu lại từ Turn 1.

## 7. Hai skill repo-local bạn nên dùng thường xuyên

### `social-listening-v3-production-audit`

Dùng khi bạn muốn:

- chạy live case
- lấy evidence từ production thật
- dừng ở checkpoint verdict

Nó không nên:

- tự nhảy vào code
- tự tạo branch
- tự merge

### `social-listening-v3-phase-executor`

Dùng khi bạn đã chốt hướng và muốn:

- latest main
- branch mới
- docs/checkpoints
- code/validation
- candidate summary

Nó không nên:

- tự merge
- tự deploy production
- bỏ qua docs/checkpoints

## 8. Prompt grammar nên dùng hằng ngày

Dùng công thức 4 dòng này:

```text
@<bot> hay tro chuyen voi codex va dung <skill neu can>.
Repo: <repo>
Muc tieu: <goal cua gate hien tai>
Rule: <dung o dau / chi hoi toi neu blocked that>
```

Ví dụ audit:

```text
@linux_mainbot hay tro chuyen voi codex va dung skill social-listening-v3-production-audit.
Repo: social-listening-v3
Muc tieu: chay live case ngu-hoa-market-sentiment va tpbank-evo-general-feedback, doi chieu phase active, tao checkpoint verdict.
Rule: dung o checkpoint verdict, chua implement, chua deploy.
```

Ví dụ direction lock:

```text
Chot huong: contained-fix.
Chi sua browser lease va closeout retry trong scope phase hien tai.
Dung social-listening-v3-phase-executor va dung o candidate summary.
```

Ví dụ phase executor:

```text
@gaubot hay tro chuyen voi codex va dung skill social-listening-v3-phase-executor.
Repo: social-listening-v3
Muc tieu: lay latest main, tao branch codex/phase-10-answer-quality, dong goi docs, break checkpoint, implement, validate, tao candidate summary.
Rule: dung o candidate summary, khong merge, khong deploy.
```

Ví dụ merge gate:

```text
@linux_mainbot hay tro chuyen voi codex va chuan bi merge/deploy gate cho candidate nay.
Repo: social-listening-v3
Muc tieu: tom tat candidate summary, neu khong con blocker thi dung truoc buoc merge production.
Rule: khong merge neu toi chua chot.
```

## 9. Bốn ví dụ end-to-end nên học thuộc

### Ví dụ 1: Audit xong rồi mở phase mới

Bạn nói:

```text
@linux_mainbot hay tro chuyen voi codex va dung skill social-listening-v3-production-audit.
Repo: social-listening-v3
Muc tieu: chay live case ngu-hoa-market-sentiment va tpbank-evo-general-feedback, doi chieu voi phase active, tao checkpoint verdict.
Rule: dung o checkpoint verdict.
```

Bot/Codex trả:

- run packet
- phase expectation vs actual
- user problem solved hay chưa
- recommendation

Bạn chốt:

```text
Chot huong: new-phase.
Phase tiep theo phai giai quyet answer quality sau closeout va source memory giua cac run.
Dung social-listening-v3-phase-executor va dung o candidate summary.
```

### Ví dụ 2: Audit xong thấy chỉ là regression nhỏ

Bạn nói:

```text
@linux_mainbot hay tro chuyen voi codex va dung skill social-listening-v3-production-audit.
Repo: social-listening-v3
Muc tieu: chi chay case tpbank-evo-general-feedback va tao checkpoint verdict.
Rule: dung o checkpoint verdict.
```

Verdict cho thấy:

- browser lease
- closeout retry
- mọi thứ vẫn nằm trong scope phase hiện tại

Bạn chốt:

```text
Chot huong: contained-fix.
Chi sua browser lease va closeout retry trong scope phase hien tai.
Dung social-listening-v3-phase-executor va dung o candidate summary.
```

### Ví dụ 3: Candidate summary có rồi nhưng bạn chưa muốn merge

Bạn nói:

```text
Dung truoc gate merge.
Toi muon brainstorm them ve source memory giua cac run, sau do quay lai social-listening-v3-phase-executor cho phase nay.
```

Điều đúng ở đây:

- bạn giữ lại Gate 2
- không merge non
- cho phép replay có chủ đích

### Ví dụ 4: Deploy xong phải quay lại production

Sau khi đã merge/deploy, bạn nói:

```text
@linux_mainbot hay tro chuyen voi codex va dung skill social-listening-v3-production-audit.
Repo: social-listening-v3
Muc tieu: revalidate sau deploy bang dung case tpbank-evo-fee-complaint va ngu-hoa-market-sentiment, so sanh delta voi run truoc.
Rule: dung o checkpoint verdict.
```

Điều quan trọng:

- deploy không phải điểm kết thúc
- production revalidation mới là điểm khóa vòng

## 10. Trang demo riêng cho social-listening-v3

Nếu muốn xem dưới dạng game/demo thay vì chỉ đọc guide, hãy mở trang:

- `/social-listening-arena`

Trang này mô phỏng riêng:

- bạn nói gì với bot
- bot dispatch gì sang Codex
- Codex chạy skill nào và tạo artifact gì
- lúc nào phải dừng ở Gate 1 hay Gate 2
- `linux_main`, `lavis_linux`, `gaubot` khác nhau ra sao trong vòng phát triển `social-listening-v3`

## 11. Những lỗi bạn rất dễ lặp lại

### Lỗi 1: Trộn nhiều gate

Ví dụ:

```text
audit xong fix luon va merge luon nhe
```

Đây là lỗi số 1 vì nó phá toàn bộ cấu trúc human gate.

### Lỗi 2: Không nói rõ live hay artifact-only

Nếu bạn không nói rõ:

- agent có thể chọn mode không đúng
- evidence không đủ mạnh để chốt hướng

### Lỗi 3: Không nói rõ issue mới hay issue cũ

Nếu đang ở section cũ mà mở việc mới, hãy nói:

```text
Day la issue moi.
```

Nếu đang nối tiếp việc cũ, hãy nói:

```text
Cung issue nay.
```

### Lỗi 4: Không nói rõ điểm dừng

Các điểm dừng an toàn nhất hiện tại là:

- `checkpoint verdict`
- `candidate summary`
- `dung truoc gate merge`

## 12. Auth, quota, rate limit: policy phải dễ hiểu

Policy hiện tại đã chốt:

- không tự xoay API key âm thầm
- nếu Codex bị `rate_limited`, `quota_exhausted`, `auth_required` hoặc tương tự:
  - chuyển sang `pair-device auth`
  - gửi alert cho bạn
  - sau khi auth lại, hệ thống có thể `auto-probe` và `auto-resume`

Đây là cách đúng vì:

- dễ hiểu
- dễ dự đoán
- không làm bạn mất niềm tin vào account đang dùng

## 13. Những command nên nhớ trên linuxvm

```bash
repo-path social-listening-v3
codex
codex-ticket
codex-dispatch
codex-telegram-dispatch
```

Những path kỹ thuật quan trọng:

```text
~/.openclaw/runtime/codex-section-bindings.json
~/.openclaw/codex-supervisor/runtime/tickets/<ticket>.json
<workspace>/.openclaw/tickets/<ticket>/CONTEXT-<ticket>.md
~/.codex/skills
```

## 14. Daily routine ngắn nhất có thể

Nếu chỉ muốn nhớ phiên bản ngắn nhất, hãy nhớ:

1. Chọn đúng control surface: OpenClaw hay Codex trực tiếp.
2. Một prompt chỉ đi qua một gate.
3. Audit phải dừng ở checkpoint verdict.
4. Bạn phải chốt contained-fix hay new-phase.
5. Executor phải dừng ở candidate summary.
6. Merge/deploy là Gate 2 của bạn.
7. Sau deploy phải quay lại production audit.

## 15. Câu hỏi đúng nhất để tự kiểm tra mình

Trước khi gửi prompt, hãy tự hỏi:

```text
Mình đang ở gate nào?
Mình muốn dừng ở đâu?
Mình đang dùng bot nào và vì sao?
Mình cần production truth, implementation, hay release decision?
```

Nếu bạn trả lời được 4 câu này, xác suất dùng OpenClaw x Codex đúng cách sẽ rất cao.
