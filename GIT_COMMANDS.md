# Git Commands Used In This Project

Tài liệu này ghi lại các lệnh git đã dùng trong quá trình dọn repo, tạo branch, commit, push và chỉnh lại lịch sử commit cho `Project-JobGo`.

## 1. Kiểm tra trạng thái repo

```bash
git status --short --branch
```

Tác dụng:
- xem branch hiện tại
- xem file nào đang sửa, thêm mới, xóa
- xem branch local có đang theo dõi remote hay không

## 2. Xem branch hiện tại

```bash
git branch --show-current
```

Tác dụng:
- trả về đúng tên branch hiện đang đứng
- hữu ích trước khi commit hoặc push để tránh làm nhầm branch

## 3. Xem remote đang trỏ về đâu

```bash
git remote -v
```

Tác dụng:
- kiểm tra URL fetch/push của repo
- dùng khi cần xác minh repo local đang nối tới đúng GitHub repo hay chưa

## 4. Đổi remote origin sang repo mới

```bash
git remote set-url origin https://github.com/nhutrunghai/Project-JobGo.git
```

Tác dụng:
- đổi địa chỉ remote `origin`
- dùng khi muốn chuyển repo local sang push vào một GitHub repo khác

## 5. Xem lịch sử commit ngắn gọn

```bash
git log --oneline --decorate --graph --all -20
```

Tác dụng:
- xem cây lịch sử commit
- biết branch nào đang trỏ vào commit nào
- dùng khi cần đánh giá lịch sử trước khi rewrite hoặc merge

## 6. Xem nhanh nội dung một commit

```bash
git show --stat --oneline --summary <commit_sha>
```

Tác dụng:
- xem commit đó đã thay đổi file gì
- giúp đặt lại commit message cho đúng bản chất thay đổi

## 7. Tạo branch mới để phát triển tính năng

```bash
git checkout -b feature/company-job-foundation
```

Tác dụng:
- tạo branch mới từ branch hiện tại
- đồng thời chuyển sang branch đó luôn

## 8. Stage thay đổi trước khi commit

```bash
git add backend/src
```

hoặc

```bash
git add -A
```

Tác dụng:
- `git add backend/src`: chỉ stage phần code backend cần commit
- `git add -A`: stage toàn bộ thay đổi hiện có, gồm file sửa, thêm mới và xóa

## 9. Kiểm tra phần đã stage

```bash
git diff --cached --stat
```

Tác dụng:
- xem đúng những gì sắp được commit
- rất quan trọng để tránh commit nhầm file rác hoặc file unrelated

## 10. Tạo commit

```bash
git commit -m "feat: add company and job foundation modules"
```

Tác dụng:
- lưu một mốc thay đổi có ý nghĩa vào lịch sử git
- nên dùng message rõ ràng theo kiểu `feat`, `fix`, `refactor`, `docs`, `chore`

## 11. Push branch feature lên remote lần đầu

```bash
git push -u origin feature/company-job-foundation
```

Tác dụng:
- đẩy branch local lên GitHub
- thiết lập upstream để những lần sau chỉ cần `git push`

## 12. Lấy cập nhật mới nhất từ remote

```bash
git fetch origin
```

Tác dụng:
- đồng bộ metadata và commit mới từ remote
- không tự merge vào branch local
- nên dùng trước khi so sánh local với remote

## 13. Tạo branch backup trên remote trước khi rewrite history

```bash
git push origin origin/main:refs/heads/backup/main-before-rewrite-2026-04-04
```

Tác dụng:
- tạo một branch backup trên GitHub từ trạng thái hiện tại của `origin/main`
- dùng làm điểm khôi phục nếu rewrite lịch sử bị lỗi

## 14. Dựng lại main với commit message sạch hơn

```bash
git checkout d0bd518 -b rewrite-main-v2
```

Tác dụng:
- tạo một branch tạm từ commit nền
- dùng khi muốn dựng lại lịch sử sạch hơn thay vì sửa trực tiếp trên `main`

## 15. Áp lại nội dung một commit nhưng tự đặt message mới

```bash
git cherry-pick -n <commit_sha>
git commit -m "feat: implement authentication core and token infrastructure"
```

Tác dụng:
- `git cherry-pick -n`: lấy thay đổi của commit cũ nhưng chưa tạo commit mới
- sau đó tự commit lại với message rõ ràng hơn

Đây là cách an toàn để làm sạch lịch sử commit khi `filter-branch` hoặc interactive rebase không thuận tiện.

## 16. Force push lịch sử mới lên main

```bash
git push --force-with-lease origin rewrite-main-v2:main
```

Tác dụng:
- ghi đè lịch sử `main` trên remote bằng nhánh đã rewrite
- `--force-with-lease` an toàn hơn `--force` vì nó sẽ kiểm tra remote chưa bị người khác cập nhật ngoài ý muốn

Lưu ý:
- chỉ dùng khi bạn hiểu rõ mình đang rewrite history
- nên tạo branch backup trước khi làm

## 17. Quay lại branch làm việc chính

```bash
git checkout feature/company-job-foundation
```

Tác dụng:
- quay lại branch feature để tiếp tục phát triển
- giữ `main` cho mục đích ổn định hoặc chuẩn bị merge

## 18. Quy tắc làm việc khuyến nghị

Flow nên dùng trong dự án này:

1. tạo branch mới cho một capability rõ ràng
2. code theo từng mốc nhỏ có ý nghĩa
3. commit với message rõ ràng
4. push branch lên remote sau 1-3 commit sạch hoặc khi đạt một mốc ổn
5. chỉ merge khi branch đã hoàn chỉnh một capability đủ dùng

Ví dụ mốc tốt để commit:
- thêm validator cho job
- thêm schema và index cho job application
- thêm route create job
- thêm route list company jobs

Ví dụ mốc tốt để push:
- build pass
- Postman test được
- code đã sạch và không còn dang dở giữa chừng

## 19. Ghi nhớ thực tế cho repo này

- Không làm trực tiếp trên `main`
- `main` dùng để giữ lịch sử đẹp và ổn định hơn cho CV
- `feature/company-job-foundation` là nơi tiếp tục phát triển hiện tại
- branch backup chỉ để khôi phục, không phải để merge vào `main`
