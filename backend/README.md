## Status code hay dung

### 2xx Thanh cong
- 200 OK: Thanh cong.
- 201 Created: Tao moi thanh cong.
- 204 No Content: Thanh cong nhung khong co noi dung tra ve.

### 4xx Loi tu client
- 400 Bad Request: Du lieu gui len khong hop le.
- 401 Unauthorized: Chua xac thuc (thieu/het han token).
- 403 Forbidden: Khong du quyen truy cap.
- 404 Not Found: Khong tim thay tai nguyen.
- 409 Conflict: Xung dot du lieu (vi du trung khoa).
- 422 Unprocessable Entity: Du lieu dung dinh dang nhung khong hop le.

### 5xx Loi tu server
- 500 Internal Server Error: Loi khong xac dinh tu server.
- 502 Bad Gateway: Gateway/Proxy nhan phan hoi khong hop le.
- 503 Service Unavailable: Dich vu tam thoi khong san sang.


Code	Constant	Reason Phrase
100	CONTINUE	Continue
101	SWITCHING_PROTOCOLS	Switching Protocols
102	PROCESSING	Processing
103	EARLY_HINTS	Early Hints
200	OK	OK
201	CREATED	Created
202	ACCEPTED	Accepted
203	NON_AUTHORITATIVE_INFORMATION	Non Authoritative Information
204	NO_CONTENT	No Content
205	RESET_CONTENT	Reset Content
206	PARTIAL_CONTENT	Partial Content
207	MULTI_STATUS	Multi-Status
300	MULTIPLE_CHOICES	Multiple Choices
301	MOVED_PERMANENTLY	Moved Permanently
302	MOVED_TEMPORARILY	Moved Temporarily
303	SEE_OTHER	See Other
304	NOT_MODIFIED	Not Modified
305	USE_PROXY	Use Proxy
307	TEMPORARY_REDIRECT	Temporary Redirect
308	PERMANENT_REDIRECT	Permanent Redirect
400	BAD_REQUEST	Bad Request
401	UNAUTHORIZED	Unauthorized
402	PAYMENT_REQUIRED	Payment Required
403	FORBIDDEN	Forbidden
404	NOT_FOUND	Not Found
405	METHOD_NOT_ALLOWED	Method Not Allowed
406	NOT_ACCEPTABLE	Not Acceptable
407	PROXY_AUTHENTICATION_REQUIRED	Proxy Authentication Required
408	REQUEST_TIMEOUT	Request Timeout
409	CONFLICT	Conflict
410	GONE	Gone
411	LENGTH_REQUIRED	Length Required
412	PRECONDITION_FAILED	Precondition Failed
413	REQUEST_TOO_LONG	Request Entity Too Large
414	REQUEST_URI_TOO_LONG	Request-URI Too Long
415	UNSUPPORTED_MEDIA_TYPE	Unsupported Media Type
416	REQUESTED_RANGE_NOT_SATISFIABLE	Requested Range Not Satisfiable
417	EXPECTATION_FAILED	Expectation Failed
418	IM_A_TEAPOT	I'm a teapot
419	INSUFFICIENT_SPACE_ON_RESOURCE	Insufficient Space on Resource
420	METHOD_FAILURE	Method Failure
421	MISDIRECTED_REQUEST	Misdirected Request
422	UNPROCESSABLE_ENTITY	Unprocessable Entity
423	LOCKED	Locked
424	FAILED_DEPENDENCY	Failed Dependency
426	UPGRADE_REQUIRED	Upgrade Required
428	PRECONDITION_REQUIRED	Precondition Required
429	TOO_MANY_REQUESTS	Too Many Requests
431	REQUEST_HEADER_FIELDS_TOO_LARGE	Request Header Fields Too Large
451	UNAVAILABLE_FOR_LEGAL_REASONS	Unavailable For Legal Reasons
500	INTERNAL_SERVER_ERROR	Internal Server Error
501	NOT_IMPLEMENTED	Not Implemented
502	BAD_GATEWAY	Bad Gateway
503	SERVICE_UNAVAILABLE	Service Unavailable
504	GATEWAY_TIMEOUT	Gateway Timeout
505	HTTP_VERSION_NOT_SUPPORTED	HTTP Version Not Supported
507	INSUFFICIENT_STORAGE	Insufficient Storage
511	NETWORK_AUTHENTICATION_REQUIRED	Network Authentication Required


auth.service.ts         # Đăng nhập, Đăng ký, Token, OTP
    users.service.ts        # Quản lý Profile (tên, tuổi, avatar)
    cv.service.ts           # Quản lý các bản CV
    jobs.service.ts         # Quản lý tin tuyển dụng
    applications.service.ts # Quản lý việc nộp đơn ứng tuyển
    email.service.ts        # Service dùng chung để gửi mail
