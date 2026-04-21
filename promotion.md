# Job Promotion / Featured Jobs Idea

## Muc tieu

Them tinh nang nap tien va chay quang cao job cho nha tuyen dung.

Trang chu se co 2 nhom job:

- `featured jobs`: job noi bat, hien thi uu tien dau tien
- `latest jobs`: job moi nhat, hien thi sau featured jobs

Nha tuyen dung co the nap tien vao vi, sau do dung so du de mua goi day job len khu vuc featured.

## Huong thiet ke chinh

Khong nen them truc tiep cac field quang cao vao `jobs` schema nhu:

- `is_featured`
- `featured_until`
- `boost_score`

Ly do:

- `jobs` dang lien quan den public listing va Elasticsearch.
- Neu gan logic quang cao vao `jobs`, moi lan thay doi trang thai quang cao co the phai tinh den viec sync search index.
- Quang cao la nghiep vu rieng, nen tach collection rieng de de mo rong va bao tri.

Nen tao collection rieng:

```text
job_promotions
```

Ten nay tong quat hon `featured_jobs`, vi sau nay co the mo rong them nhieu loai quang cao:

- `homepage_featured`
- `search_boost`
- `category_featured`
- `urgent_hiring`

## Job promotion phai co thoi han

Job noi bat nen bat buoc co thoi han.

Neu khong co thoi han:

- Job co the noi bat mai mai sau mot lan tra tien.
- Trang chu bi chiem boi job cu.
- Kho dinh gia goi quang cao.
- Khong tao duoc doanh thu lap lai.
- Job het han tuyen dung nhung van co the bi hien thi noi bat.

Dieu kien de mot job promotion duoc hien thi:

```text
promotion.status = active
promotion.starts_at <= now
promotion.ends_at > now
job.status = open
job.moderation_status = active
job.published_at != null
job.expired_at > now
```

Tuc la promotion con han chua du. Ban than job cung phai con public hop le.

## Khong dung TTL de xoa promotion khi het han

Khong nen dung TTL index de xoa record trong `job_promotions` ngay khi het han.

Ly do:

- Promotion lien quan den giao dich tien.
- Employer can xem lich su da mua goi nao.
- Admin can doi soat doanh thu.
- Can debug khi employer khieu nai da mua quang cao nhung khong hien thi.
- Sau nay can thong ke hieu qua quang cao.

Huong dung:

- Giu lai record promotion.
- Khi query featured jobs thi loc bang `starts_at` va `ends_at`.
- Co the them cron sau nay de update `status` tu `active` sang `expired`.

MVP co the chua can cron:

```text
status = active
ends_at <= now
```

Record het han van nam trong DB, nhung khong duoc hien thi vi query yeu cau `ends_at > now`.

## Schema de xuat

```ts
{
  _id: ObjectId,
  job_id: ObjectId,
  company_id: ObjectId,

  type: 'homepage_featured',

  status: 'scheduled' | 'active' | 'expired' | 'cancelled',

  starts_at: Date,
  ends_at: Date,

  priority: number,

  amount_paid: number,
  currency: 'VND',

  payment_id?: ObjectId,
  wallet_transaction_id?: ObjectId,

  created_at: Date,
  updated_at: Date
}
```

Giai thich:

- `job_id`: job duoc day noi bat.
- `company_id`: cong ty so huu job, dung de check quyen.
- `type`: loai quang cao.
- `status`: trang thai promotion.
- `starts_at`, `ends_at`: thoi gian hieu luc.
- `priority`: uu tien hien thi neu co nhieu job noi bat.
- `amount_paid`: tong tien da tra cho promotion nay.
- `payment_id` hoac `wallet_transaction_id`: lien ket thanh toan / giao dich vi.

## Wallet va payment

Nen tach thanh 2 phan:

```text
Wallet / Payment
Promotion / Ads
```

Khong nen gan truc tiep "nap tien" vao "featured job", vi so du vi sau nay co the dung cho nhieu tinh nang khac.

Flow tong:

```text
Employer nap tien
-> tao payment transaction
-> payment success
-> cong balance vao wallet

Employer chon job
-> chon goi featured
-> backend kiem tra balance
-> tru tien
-> tao hoac gia han job_promotion
-> job xuat hien trong featured section
```

## Endpoint de xuat

Nap tien:

```http
POST /api/v1/employer/wallet/top-up
```

Xem so du:

```http
GET /api/v1/employer/wallet
```

Lich su vi:

```http
GET /api/v1/employer/wallet/transactions
```

Mua hoac gia han quang cao cho job:

```http
POST /api/v1/employer/jobs/:jobId/promotions
```

Lay featured jobs public cho trang chu:

```http
GET /api/v1/jobs/featured?page=1&limit=8
```

Lay latest jobs public cho trang chu:

```http
GET /api/v1/jobs/latest?page=1&limit=8
```

## Endpoint mua promotion

Endpoint mua promotion nen vua tru tien trong vi vua tao/gia han promotion.

Hai viec nay phai nam trong cung MongoDB transaction de tranh lech du lieu:

- tru tien thanh cong nhung tao promotion fail
- tao promotion thanh cong nhung chua tru tien

Request body nen dung `package_code`, khong nen tin gia tien tu frontend:

```json
{
  "package_code": "featured_7_days"
}
```

Package config nen nam o backend:

```ts
const promotionPackages = {
  featured_3_days: {
    type: 'homepage_featured',
    days: 3,
    price: 50000,
    currency: 'VND'
  },
  featured_7_days: {
    type: 'homepage_featured',
    days: 7,
    price: 100000,
    currency: 'VND'
  },
  featured_14_days: {
    type: 'homepage_featured',
    days: 14,
    price: 180000,
    currency: 'VND'
  }
}
```

Flow service:

```text
1. Lay employerId tu token.
2. Lay company cua employer.
3. Kiem tra jobId thuoc company do.
4. Kiem tra job con public hop le.
5. Lay package theo package_code.
6. Kiem tra wallet balance >= package price.
7. Tru tien trong wallet.
8. Ghi wallet transaction / ledger.
9. Tao promotion moi hoac gia han promotion dang active.
10. Tra response.
```

## Gia han promotion

Neu job chua co promotion active:

```text
starts_at = now
ends_at = now + package.days
status = active
```

Neu job dang co promotion active:

```text
starts_at giu nguyen
ends_at = current ends_at + package.days
```

Vi du:

```text
Hom nay: 21/04
Job dang featured den 25/04
Employer mua them goi 7 ngay
New ends_at = 02/05
```

Khong nen tinh lai tu `now`, vi se lam employer mat cac ngay con lai.

## Ranking featured jobs

Featured jobs nen sort truoc latest jobs.

Trong nhom featured jobs, MVP co the sort:

```text
priority desc
starts_at desc
```

Neu chua can `priority`, co the sort:

```text
starts_at desc
```

Sau nay co the mo rong:

- Goi gia cao co priority cao hon.
- Random rotate trong cung priority.
- Gioi han so slot featured tren trang chu.

## Ket luan tam thoi

Huong nen lam:

```text
1. Tao wallet va wallet transactions cho employer.
2. Tao job_promotions rieng, khong gan truc tiep vao jobs.
3. Endpoint mua promotion vua tru tien vua tao/gia han promotion trong transaction.
4. Promotion co starts_at va ends_at, khong TTL delete khi het han.
5. Trang chu hien featured jobs truoc, latest jobs sau.
```
