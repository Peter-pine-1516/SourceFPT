# Tài Liệu Cốt Lõi PRM393 (Flutter & Dart) — Đọc 1 Lần Nắm Trọn 5 Đề FE

Tài liệu này hệ thống hoá **100% định nghĩa và khái niệm (158 câu gốc / 248 câu tổng)** xuất hiện trong 5 bộ đề thi `SP26` & `SU26`. Các **cụm từ tiếng Anh in đậm** chính là từ khoá chuẩn xác xuất hiện trong đề thi để cậu đọc hiểu bản chất bằng tiếng Việt nhưng nhận diện đáp án tiếng Anh ngay lập tức.

> **Mẹo đọc 1 lần nhớ luôn:** Môn PRM393 xoay quanh một tư tưởng xuyên suốt của Flutter: **UI là hàm của State** (*giao diện chỉ là bản mô tả bất biến, khi State đổi thì Flutter vẽ lại phần giao diện bị ảnh hưởng*). Nắm câu này là giải thích được hơn một nửa số câu hỏi trong đề!

---

## Chương 1: Tổng Quan Hệ Sinh Thái & Kiến Trúc Flutter

### 1.1. Bản chất của Flutter và Flutter SDK
- **Flutter** dùng để làm gì? Xây dựng ứng dụng gốc đa nền tảng từ **một mã nguồn duy nhất** (**Creating native applications from a single codebase** / **Enables building apps from a single codebase for multiple platforms**).
- **Lợi ích của Single Codebase**: Giảm đáng kể công sức phát triển và bảo trì (**Reduced development and maintenance effort**).
- **Các nền tảng mục tiêu (Target platforms)**: Chỉ với 1 codebase, Flutter chạy được trên cả **Android, iOS, web, and desktop**.
- **Flutter SDK (Software Development Kit)**: Cung cấp bộ công cụ và thư viện để phát triển ứng dụng Flutter (**To provide tools and libraries for Flutter development**).
- **Quy trình khởi đầu bắt buộc**:
  1. Trước khi chạy app lần đầu tiên: Phải cài đặt và thiết lập **Setting up the Flutter SDK**.
  2. Để chạy và kiểm thử trên máy cá nhân: Cần máy ảo hoặc thiết bị thật (**An emulator or physical device**).
  3. Việc thường làm ngay sau khi tạo project mới: Chạy thử ứng dụng mặc định lên thiết bị (**Running the default app on a device**).
- **Hot Reload** (*xuất hiện 3 đề*): Phản ánh tức thì thay đổi code lên giao diện mà không mất trạng thái đang chạy (**Instantly reflect code changes in UI**).

### 1.2. Kiến trúc 3 tầng của Flutter
- **Framework Layer (Dart)**: Cung cấp các thành phần giao diện và logic dựng hình (**It provides UI components and rendering logic**).
- **Engine Layer (C++ & Skia)**: Tầng viết bằng **C++ sử dụng Skia** chịu trách nhiệm trực tiếp cho việc kết xuất đồ hoạ (**Rendering**).
- **Embedder Layer**: Tầng giao tiếp trực tiếp với hệ điều hành đích (Android, iOS, Windows, Web).

---

## Chương 2: Ngôn Ngữ Lập Trình Dart

Flutter sử dụng ngôn ngữ **Dart** vì Dart là ngôn ngữ lập trình đa mục đích nhưng được tối ưu riêng cho giao diện người dùng (**General-purpose programming with UI focus**), hỗ trợ hiệu quả cả logic giao diện lẫn logic nghiệp vụ (**It supports both UI and application logic efficiently**).

| Khái niệm trong Dart | Định nghĩa chuẩn & Từ khoá nhận diện trong đề |
| :--- | :--- |
| **OOP (Lập trình hướng đối tượng)** | Được hỗ trợ thông qua lớp và đối tượng (**Classes and objects**). Một `class` đại diện cho **bản thiết kế để tạo đối tượng** (**A blueprint for creating objects** — *lặp 3 đề*). |
| **Null Safety** | Tính năng ngăn chặn lỗi tham chiếu `null` ngay tại **thời điểm biên dịch** (**Null safety**). Nếu một biến **non-nullable** không được khởi tạo giá trị → báo lỗi biên dịch (**A compile-time error occurs**). |
| **`const` vs `final`** | **`const`**: Hằng số xác định ngay lúc **biên dịch** (**compile time** — *lặp 3 đề*).<br>**`final`**: Biến chỉ gán 1 lần duy nhất (lúc chạy), giá trị cố định sau khi gán (**The variable value is fixed after assignment**). |
| **`List` vs `Map`** | **`List`**: Lưu trữ tập hợp các phần tử **có thứ tự** (**ordered collection of items**).<br>**`Map`**: Lưu trữ các cặp **khoá - giá trị** (**Storing key-value pairs**). |
| **Generics (`<T>`)** | Cho phép viết các thành phần tái sử dụng mà vẫn an toàn kiểu dữ liệu (**reusable, type-safe components**). |
| **Packages and imports** | Giúp chia nhỏ và tổ chức mã nguồn thành các thư viện tái sử dụng (**organize code into reusable libraries**). |
| **`Future` & `await`** | Từ khoá **`await`** dùng để tạm dừng thực thi hàm bất đồng bộ cho tới khi `Future` hoàn tất (**pause execution until a Future completes**). |

---

## Chương 3: Cây Widget, Giao Diện & Bố Cục (Layout / Slivers)

### 3.1. Bản chất của Widget và `BuildContext`
- **Vai trò chính của Widget**: Mô tả giao diện người dùng (**Describing the user interface**). Giao diện nội bộ của Flutter được cấu trúc thành **cây phân cấp Widget** (**Using a hierarchical widget tree**).
- **Tại sao Widget rất nhẹ (lightweight) và bất biến (immutable)?**
  - Widget chỉ là **các bản mô tả bất biến** (**They are immutable descriptions**), không trực tiếp giữ pixel vẽ.
  - Cây Widget được coi là **immutable** vì khi đổi giao diện, các Widget sẽ **được tạo mới thay vì sửa đổi trực tiếp** (**Widgets are recreated instead of modified**).
- **Kiến trúc dựa trên Widget (Widget-based architecture)** & **Widget Composition (Ghép nối các widget nhỏ)**: Giúp tái sử dụng code đa nền tảng và đảm bảo sự đồng nhất giao diện (**Widgets allow code reuse across platforms** / **Better code reuse and UI consistency**).
- **Phương thức `build()`**: Trả về một cây widget mô tả giao diện (**A widget tree describing the UI**).
- **Hiểu vòng đời Widget (Widget lifecycle)**: Giúp quản lý việc cập nhật giao diện chính xác (**Manage UI updates correctly**).
- **`BuildContext`**: Xác định vị trí của một widget bên trong cây widget (**Locate widgets in the widget tree**).

### 3.2. Các Widget nền tảng, Bố cục & Cuộn trang
| Nhóm | Tên Widget / Thuộc tính | Chức năng chuẩn xác |
| :--- | :--- | :--- |
| **Khung App** | **`MaterialApp`** | Widget gốc phổ biến của ứng dụng (**root of a Flutter app**), áp dụng **Theme cho toàn bộ ứng dụng** (**applies a theme to an entire Flutter application**). |
| | **`Scaffold`** | Khung cấu trúc nền tảng của một màn hình Material Design (**structural foundation of a Material Design screen** — chứa AppBar, Body, FloatingActionButton, Drawer...). |
| | **`ThemeData`** | Định nghĩa phong cách hiển thị xuyên suốt toàn ứng dụng (**Define application-wide visual styles**). Thời điểm tuỳ chỉnh Theme hợp lý nhất là trong **pha thiết kế UI/UX** (**During UI/UX design phase**). |
| **Bố cục cơ bản** | **`Container`** | Dùng để bố cục, trang trí kiểu dáng và định vị (**Layout, styling, and positioning**). |
| | **`Padding`** | Thêm khoảng trống **bên trong** một widget (**Adds space inside a widget**). |
| | **`SizedBox`** | Cách tốt nhất để tạo một khoảng trống kích thước cố định (**add fixed empty space**). |
| | **`Column`** | Sắp xếp các widget con theo **chiều dọc** (**arrange children vertically**). Trong `Column`, trục chính (`mainAxis`) là dọc nên **`crossAxisAlignment`** điều khiển **căn lề ngang** (**Horizontal alignment in Column**). |
| | **`Stack`** | Cho phép các widget con **xếp chồng đè lên nhau** (**overlapping of its child widgets**). |
| | **`GridView`** | Hiển thị danh sách phần tử dạng **lưới** (**grid layout**). |
| **Cuộn nâng cao (Slivers)** | **`CustomScrollView`** | Bật hiệu ứng cuộn tuỳ biến (**custom scroll effects**) và cho phép danh sách cuộn tương tác mượt với thanh tiêu đề (**allows both scrolling and app bars to interact**). |
| | **`SliverAppBar`** | Thanh tiêu đề linh hoạt có thể co giãn/ẩn hiện khi cuộn (**Scrollable flexible app bar**). |
| | **`SliverList`** | Sliver dùng để hiển thị danh sách cuộn dọc bên trong `CustomScrollView` (**display a scrolling list**). |

---

## Chương 4: Biểu Mẫu & Nhập Liệu (Forms & Input)

- **Vai trò của Form**: Thu thập dữ liệu từ người dùng (**User data collection**).
- **Nguyên tắc thiết kế tăng trải nghiệm Form**: Nhãn rõ ràng và phản hồi trực quan (**Clear labels and feedback**).
- **Các thành phần làm việc với Form**:
  - **`TextField`** (với `obscureText: true`): Widget nhập văn bản có khả năng ẩn ký tự khi nhập mật khẩu (**hide user input text when configured for password entry**).
  - **`TextInputType.emailAddress`**: Bàn phím tối ưu cho nhập địa chỉ email (hiện sẵn phím `@`).
  - **`TextEditingController`**: Quản lý và đọc/ghi giá trị văn bản đang nhập (**Text input value**).
  - **Khi kiểm tra hợp lệ thất bại (`validation fails`)**: Hiển thị thông báo lỗi trên màn hình (**Error messages are shown**).
  - **`onSaved` callback**: Lưu trữ giá trị của các trường trong form khi lưu (**Store form values**).
  - **`reset()`** (trên `FormState`): Đặt lại toàn bộ các ô trong form về trạng thái ban đầu (**resets all form fields**).

---

## Chương 5: Điều Hướng Màn Hình (Navigation & Routing)

- **Cơ chế hoạt động của `Navigator`**: Quản lý các màn hình theo cấu trúc **Ngăn xếp — Stack (`push` và `pop`)** (**Screens are managed using a stack**):
  - `Navigator.push()`: Đẩy màn hình mới lên đỉnh stack.
  - **`Navigator.pop()`**: Đóng màn hình hiện tại để quay về màn hình trước (**Close current screen**).
- **Tại sao phải truyền `context` khi điều hướng?** Để tìm và truy cập đối tượng `Navigator` gần nhất trong cây widget (**Access Navigator**).
- **Cách chuẩn để truyền dữ liệu sang màn hình mới** (*lặp 3 đề*): Truyền qua **tham số hàm khởi tạo** của Widget màn hình đích (**Via constructor arguments**).
- **Route Guard (`Guard` pattern)**: Mẫu thiết kế dùng để kiểm tra đăng nhập và bảo vệ các đường dẫn cần xác thực (**protects authenticated routes**).
- **Tại sao cần tổ chức logic điều hướng rõ ràng?** Để dễ bảo trì mã nguồn (**Improve maintainability**).

---

## Chương 6: Quản Lý Trạng Thái (State Management)

> **Mô hình Giao diện Phản ứng (Reactive UI Model):** Flutter không sửa từng ô chữ thủ công, mà **dựng lại (rebuild) giao diện tự động để phản ứng khi State thay đổi** (**Rebuilding UI in response to state changes** / **When state changes**). Nếu quản lý state kém, rủi ro lớn nhất là **giao diện hiển thị sai lệch, thiếu nhất quán** (**UI inconsistency**).

### 6.1. Local State (`setState`) & State Hoisting
- **`setState()`**: Phương thức của `StatefulWidget` có nhiệm vụ chính là **kích hoạt dựng lại cây widget** (**Trigger widget rebuild** / **The widget tree is rebuilt**) để cập nhật giao diện khi dữ liệu đổi.
- **Nguyên tắc vàng khi dùng State cục bộ**:
  - Giữ state **cục bộ nhất có thể** (**keep state as local as possible**) để giảm việc rebuild dư thừa (**Reduce unnecessary rebuilds**).
  - Hạn chế gọi `setState()` bừa bãi hoặc bọc quá rộng vì **lạm dụng `setState()` gây rebuild không cần thiết** (**Overusing setState()** / **It may trigger unnecessary rebuilds**).
  - Tách riêng phần giao diện (UI) và logic trạng thái giúp **dễ bảo trì hơn** (**Improve maintainability**).
- **State Hoisting (Đưa state lên widget cha chung)**: Giải quyết triệt để bài toán **trùng lặp trạng thái** giữa các widget con (**State duplication**).

### 6.2. Shared / Scalable State (`Provider`, `BLoC`, `Cubit`)
- **Khi nào chọn `Provider` thay vì `setState()`?** Khi cần chia sẻ trạng thái dùng chung hoặc toàn cục qua nhiều màn hình (**For global or shared state**).
- **BLoC (`Business Logic Component`)** — Mẫu kiến trúc mở rộng tốt nhất cho dự án/nhóm lớn:
  - **Tại sao hợp với nhóm lớn (large teams)?** Vì có **kiến trúc chuẩn hoá rõ ràng** (**Standardized architecture**).
  - **Nền tảng cốt lõi**: Dựa mạnh mẽ trên luồng dữ liệu bất đồng bộ **`Stream`**.
  - **Đầu vào (Input) — `Events`**: Đóng vai trò kích hoạt sự thay đổi trạng thái (**Trigger state changes**).
  - **Đầu ra (Output) — `States`**: Biểu diễn trạng thái giao diện trả ra từ BLoC (**States**).
  - **Tại sao State trong BLoC phải bất biến (`immutable`)?** Để sự thay đổi trạng thái minh bạch, dễ đoán và không bị sửa ngầm (**Predictable state changes**).
  - **Thư viện hỗ trợ**: Gói **`flutter_bloc`**.
- **`Cubit`**: Phiên bản BLoC rút gọn, gọi hàm trực tiếp để phát State mới mà **không cần lớp Event** (**Simplified BLoC without events**).

---

## Chương 7: Mạng, REST API & Giao Diện Bất Đồng Bộ

- **`REST` viết tắt của**: **Representational State Transfer**.
- **Định dạng dữ liệu phổ biến nhất trong REST API**: **`JSON`**.
- **Mục đích của Parsing JSON & Ánh xạ vào Model (Mapping to models)**: Chuyển chuỗi JSON thành đối tượng Dart (**Convert JSON into Dart objects**) nhằm **đảm bảo an toàn kiểu dữ liệu** (**Ensure type safety**).
- **Phương thức & Mã trạng thái HTTP cần nhớ**:
  - **`GET`**: Lấy dữ liệu về (**retrieve data** — *lặp 3 đề*).
  - **`POST`**: Gửi dữ liệu mới lên server (**send new data to a server**).
  - **`200`**: Thành công (**Success**) · **`404`**: Không tìm thấy tài nguyên (**Resource not found**) · **`500`**: Lỗi phía máy chủ (**Server error**).
- **Phân biệt `FutureBuilder` và `StreamBuilder` trên UI**:
  - **`FutureBuilder`**: Dùng cho tác vụ bất đồng bộ **trả về 1 lần** như gọi REST API hoặc đọc dữ liệu từ local storage (**asynchronous API responses** / **async data from local storage**).
  - **`StreamBuilder`**: Dùng cho luồng dữ liệu **thay đổi liên tục theo thời gian** như trạng thái đăng nhập người dùng (**reacts to authentication state changes**).
- **Pagination (Phân trang — *lặp 3 đề*)**: Tải từng phần nhỏ để **xử lý tập dữ liệu lớn hiệu quả** (**Handling large datasets efficiently**).
- **Công cụ debug request mạng trong Flutter**: **DevTools** (tab Network).

---

## Chương 8: Lưu Trữ Cục Bộ (Local Storage & Database)

| Giải pháp | Đặc điểm & Phương thức hay hỏi trong đề |
| :--- | :--- |
| **`shared_preferences`** | Lưu trữ cặp **key-value** cho **các giá trị nguyên thuỷ đơn giản** (**Simple primitive values**: `int`, `bool`, `double`, `String`).<br>- Lưu số nguyên: **`setInt()`** *(lưu ý không nhầm với `putInt()` của Android gốc!)*.<br>- Đọc dữ liệu chung: **`get()`**.<br>- **Hạn chế chính**: Không phù hợp cho dữ liệu lớn hoặc có cấu trúc phức tạp (**Not suitable for large or complex data**). |
| **`Hive`** | Cơ sở dữ liệu **NoSQL cục bộ gọn nhẹ**, tốc độ cao (**Lightweight local NoSQL storage**). |
| **`sqflite`** | Plugin cung cấp hỗ trợ cơ sở dữ liệu quan hệ **SQLite** cho Flutter (**SQLite support** — *lặp 3 đề*). |

- **Tại sao mọi thao tác Database phải bất đồng bộ (`asynchronous`)?** Để **tránh làm đơ luồng giao diện chính** (**Avoid blocking UI thread** — *lặp 3 đề*).
- **Repository Pattern**: Mẫu thiết kế giúp **tách biệt logic lưu trữ/nguồn dữ liệu ra khỏi tầng giao diện UI** (**separates storage logic from UI**).

---

## Chương 9: Xác Thực & Bảo Mật (Authentication & Security)

- **Mục đích cốt lõi của xác thực an toàn**: Bảo vệ dữ liệu người dùng (**Protect user data**).
- **Dịch vụ giúp tích hợp xác thực nhanh trong Flutter**: **Firebase Authentication**.
- **Luồng phiên đăng nhập (Session & Token)**:
  - Sau khi đăng nhập thành công: **Phiên làm việc của người dùng bắt đầu** (**User session starts**).
  - **Token (Access Token)**: Thông tin chứng thực quyền truy cập tạm thời (**Temporary access credential**), thường đính kèm vào HTTP Header **`Authorization`**.
  - **Refresh Token**: Dùng để **gia hạn phiên đăng nhập mà không bắt người dùng đăng nhập lại** (**Extend session without re-login**).
  - **Tập trung hoá trạng thái xác thực (Centralized auth state)**: Đảm bảo kiểm soát quyền truy cập nhất quán trên toàn bộ màn hình (**Ensure consistent access control** — *lặp 3 đề*).
  - **Chức năng Đăng xuất (`Logout`)**: Kết thúc phiên làm việc của người dùng một cách an toàn (**End user session securely**).
- **Thực hành tăng cường bảo mật**:
  - Bảo mật API truyền tải: Luôn sử dụng giao thức mã hoá **`Using HTTPS`** (không hardcode key).
  - Bảo mật thông tin đăng nhập lưu trữ: **Mã hoá thông tin xác thực** (**Encrypting credentials**).

---

## Chương 10: Hoạt Ảnh (Animations)

- **Implicit Animation (Hoạt ảnh ngầm định)**: Tự động chuyển động khi thuộc tính thay đổi mà **không cần tạo `AnimationController`** (**Animation without controller**).
  - **`AnimatedContainer`**: Ví dụ kinh điển của Implicit Animation (tự mượt khi đổi màu, kích thước, padding...).
  - **`AnimatedSwitcher`**: Tạo hiệu ứng chuyển cảnh mượt **giữa 2 widget khác nhau** (**animates between two widgets**).
- **Explicit Animation (Hoạt ảnh tường minh — điều khiển chi tiết)**:
  - **`Tween`**: Định nghĩa **khoảng giá trị bắt đầu và kết thúc** của hoạt ảnh (**Value range for animation**).
  - **`CurvedAnimation`**: Quy định đường cong gia tốc/nhịp điệu của hoạt ảnh (**Animation curve behavior**). Đường cong tạo hiệu ứng nảy như quả bóng là **`bounceOut`**.
  - **`AnimatedBuilder`**: Widget tự động dựng lại theo từng nhịp giá trị của animation (**rebuilds automatically during animation**).
  - **`v-sync` (`TickerProvider`)**: Đồng bộ nhịp vẽ với tần số quét màn hình để **tối ưu tài nguyên hoạt ảnh** (**Optimize animation resources**), tránh chạy ngầm khi khuất màn hình.
  - **Tại sao bắt buộc phải `dispose()` AnimationController?** Để **ngăn chặn rò rỉ bộ nhớ** (**Prevent memory leaks** — *lặp 3 đề*).

---

## Chương 11: Kiến Trúc Phần Mềm, Kiểm Thử (Testing) & Git

### 11.1. Quy trình & Kiến trúc phần mềm
- **Pha phân tích (`Analysis` phase)**: Giai đoạn thu thập và làm rõ yêu cầu phần mềm (**gathering requirements**).
- **Mục đích của App Architecture**: Tổ chức cấu trúc mã nguồn ngăn nắp (**Organize code structure**). Nên **quyết định kiến trúc từ sớm** để **giảm chi phí đập đi viết lại** (**Reduce refactoring cost**).
- **Clean Architecture**: Tách biệt rõ các tầng giúp **dễ bảo trì và kiểm thử độc lập** (**Easier maintenance and testing**).
- **Technical Debt (Nợ kỹ thuật)**: Chi phí phải trả trong tương lai do những quyết định thiết kế vội vàng/chưa tốt hiện tại (**Future cost of poor design decisions**).
- **Version Control (`Git`)**: Công cụ bắt buộc để **theo dõi và quản lý lịch sử thay đổi mã nguồn** (**Track and manage code changes**).

### 11.2. Kiểm thử trong Flutter (Gói `flutter_test`)
- **Mục tiêu chính của kiểm thử**: Đảm bảo chất lượng và tính đúng đắn của ứng dụng (**Ensure app quality and correctness**).
- **Tại sao cần test khi Refactoring (tái cấu trúc code)?** Đảm bảo việc sửa đổi cấu trúc không làm hỏng tính năng cũ (**Ensure changes don't break functionality**).
- **Test Isolation (Cô lập kiểm thử)**: Đảm bảo các ca kiểm thử chạy hoàn toàn độc lập, không ảnh hưởng lẫn nhau (**Independence of test cases**).

| Cấp độ trong Tháp Kiểm Thử (Testing Pyramid) | Phạm vi kiểm tra | Tốc độ & Tần suất |
| :--- | :--- | :--- |
| **1. `Unit test`** *(Đáy tháp — nhiều nhất)* | Kiểm tra từng hàm hoặc lớp đơn lẻ (**individual functions or classes**). | **Chạy nhanh nhất** (**runs fastest**). |
| **2. `Widget test`** *(Giữa tháp)* | Kiểm tra hiển thị và tương tác của **thành phần giao diện UI** (**focuses on UI components**). *(Bao gồm cả **Golden testing** dùng ảnh mẫu để kiểm tra sự đồng nhất diện mạo giao diện — **UI appearance consistency**)*. | Nhanh vừa phải. |
| **3. `Integration test`** *(Đỉnh tháp — dùng ít nhất)* | Kiểm tra hành vi tổng thể đầu-cuối của toàn ứng dụng (**End-to-end app behavior**). | Chậm nhất → theo Testing Pyramid nên **dùng số lượng ít nhất** (**used the least**). |

---

## Chương 12: Tối Ưu Hiệu Năng & Phát Hành (Chapters 13 & 14 — Plus)

### 12.1. Tối ưu hiệu năng (Chương 13)
- **Mục tiêu cốt lõi**: Đảm bảo giao diện mượt mà và phản hồi tức thì (**Ensure smooth and responsive UI**).
- **Công cụ đo đạc & phân tích hiệu năng UI**: **DevTools**.
- **5 kỹ thuật tối ưu kinh điển hay hỏi nhất trong đề**:
  1. **Dùng `const` widgets** (*lặp 3 đề*): Giúp Flutter tái sử dụng instance cũ, **giảm chi phí dựng lại** (**They reduce rebuild cost**).
  2. **Rebuild scope optimization** (*lặp 3 đề*): Thu hẹp phạm vi để **chỉ dựng lại đúng những widget thực sự bị ảnh hưởng** (**Limiting rebuild to affected widgets**).
  3. **Splitting widgets (Tách nhỏ widget)**: Thay vì nhét cả màn hình vào 1 hàm `build()` khổng lồ, tách thành các widget con riêng biệt để cải thiện hiệu năng dựng hình (**improves rendering performance**).
  4. **Fine-grained state updates**: Cập nhật trạng thái chi tiết/hạt mịn thay vì làm mới cả màn hình (**reduce unnecessary widget rebuilds**).
  5. **`RepaintBoundary`**: Cô lập vùng vẽ để tránh vẽ lại những phần giao diện không thay đổi (**avoid rebuilding/repainting unchanged UI parts**).
- **Tại sao Chương 13 (Tối ưu sâu) được xếp là phần mở rộng (Optional / Plus)?** Vì ứng dụng thông thường vẫn hoạt động đúng mà chưa cần tối ưu chuyên sâu (**Apps can work without deep optimization**).

### 12.2. Đóng gói & Triển khai (Chương 14 — Deployment)
- **Mục đích build bản `release`**: Chuẩn bị ứng dụng hoàn chỉnh để phân phối tới người dùng cuối (**Prepare app for distribution**).
- **Lệnh tạo file cài đặt Android (Release APK)**: **`flutter build apk`**.
- **Thực hành bảo mật khi phát hành**: Bảo vệ an toàn khoá ký ứng dụng (**Secure signing keys**).
- **Tại sao Chương 14 (Deployment) được xếp là phần mở rộng (Optional / Plus)?** Vì sinh viên vẫn có thể chạy và kiểm thử trọn vẹn ứng dụng mà không bắt buộc phải đưa lên chợ ứng dụng (**Apps can be tested without publishing**).
