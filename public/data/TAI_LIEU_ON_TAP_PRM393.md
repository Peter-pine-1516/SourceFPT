# Lý Thuyết PRM393 (Flutter & Dart)

> **Nguyên lý nền tảng của Flutter:** **Everything is a Widget** và **UI là hàm của State** (*giao diện là bản mô tả bất biến; khi State thay đổi, Flutter dựng lại phần giao diện bị ảnh hưởng*).

---

## Chương 1: Tổng Quan Hệ Sinh Thái & Kiến Trúc Flutter (Module 1)

### 1.1. Bản chất của Flutter, Flutter SDK & Lựa chọn công nghệ
- **Flutter** là bộ công cụ UI do Google phát triển dùng để xây dựng ứng dụng gốc đa nền tảng từ **một mã nguồn duy nhất** (**Creating native applications from a single codebase** / **Enables building apps from a single codebase for multiple platforms**).
- **Lợi ích của Single Codebase**: Giảm đáng kể công sức phát triển và bảo trì (**Reduced development and maintenance effort**), đồng nhất giao diện trên mọi thiết bị.
- **Các nền tảng mục tiêu (Target platforms)**: Chạy từ 1 codebase trên **Android, iOS, web, and desktop** (macOS, Linux, Windows).
- **Flutter SDK (Software Development Kit)**: Cung cấp bộ công cụ và thư viện để phát triển ứng dụng Flutter (**To provide tools and libraries for Flutter development**).
- **Hot Reload**: Phản ánh tức thì thay đổi code lên giao diện mà không mất trạng thái đang chạy (**Instantly reflect code changes in UI**). **Hot Restart** tải lại toàn bộ app và reset trạng thái về ban đầu.
- **Tích hợp Native (Platform Channels)**: Flutter không loại bỏ hoàn toàn mã native — phần UI & logic chạy bằng Dart, còn tính năng đặc thù phần cứng (**Camera, Bluetooth, NFC, Payment SDKs, OS-level services**) kết nối với mã Android (Kotlin/Java) hoặc iOS (Swift) qua **Platform Channels**.
- **Khi nào nên chọn Flutter vs Native**:
  - **Chọn Flutter**: App đa nền tảng dùng chung UI/logic, MVP/startup cần ra mắt nhanh, app thương mại điện tử/đặt vé/dashboard, nhóm hạn chế nhân lực Android/iOS riêng.
  - **Ưu tiên Native**: App cần tuỳ biến sâu hệ điều hành, game đồ hoạ thời gian thực hiệu năng cực cao, truy cập phần cứng cấp rất thấp, hoặc yêu cầu UI/UX tuân thủ tuyệt đối từng nền tảng.

| Tiêu chí | Flutter | React Native | Native (Android / iOS) |
| :--- | :--- | :--- | :--- |
| **Ngôn ngữ** | Dart | JavaScript / TypeScript | Kotlin / Swift |
| **Cơ chế kết xuất** | Native UI + Engine riêng (**Skia**) | Cầu nối (**Bridges**) tới Native | Pure Native |
| **Biên dịch** | **JIT** (lúc dev - Hot Reload) & **AOT** (lúc release - mã ARM) | JS runtime | Mã gốc nền tảng |

### 1.2. Kiến trúc 3 tầng & Chuỗi kết xuất (Rendering Pipeline)
- **Framework Layer (Dart)**: Tầng cao nhất cung cấp các thành phần giao diện (**Material & Cupertino widgets**), hệ thống layout và logic dựng hình (**It provides UI components and rendering logic**).
- **Engine Layer (C++ & Skia)**: Tầng viết bằng **C++ sử dụng Skia** chịu trách nhiệm trực tiếp cho việc kết xuất đồ hoạ (**Rendering**), xử lý văn bản, tăng tốc GPU.
- **Embedder Layer**: Tầng giao tiếp trực tiếp với hệ điều hành đích (quản lý cửa sổ, vòng đời app, sự kiện nhập liệu).
- **Chuỗi kết xuất giao diện**: `Widget Tree -> Render Tree -> Composited Scene -> GPU Rendering` (chi tiết 3 cây nội bộ: **Widgets** là bản mô tả bất biến, **Elements** quản lý vòng đời & state, **RenderObjects** tính toán layout, vẽ và tổng hợp khung hình).

### 1.3. Môi trường phát triển & Cấu trúc dự án Flutter
- **Quy trình khởi đầu bắt buộc**:
  1. Cài đặt và thiết lập SDK (**Setting up the Flutter SDK**), kiểm tra bằng lệnh **`flutter doctor`**.
  2. Chuẩn bị máy ảo hoặc thiết bị thật (**An emulator or physical device**).
  3. Tạo project mới và chạy thử ứng dụng mặc định (**Running the default app on a device**).
- **3 môi trường phát triển phổ biến**: **DartPad** (`dartpad.dev`, chạy trực tiếp trên trình duyệt không cần cài đặt), **VS Code** (nhẹ, chạy bằng `F5` hoặc `flutter run`), và **Android Studio** (tích hợp sẵn Android SDK và Device Manager).
- **Cấu trúc thư mục dự án Flutter**:
  - `lib/main.dart`: Điểm khởi chạy chính (entry point) của ứng dụng.
  - `pubspec.yaml`: Khai báo thư viện phụ thuộc (**dependencies**) và tài nguyên (**assets**).
  - `android/`, `ios/`, `web/`: Mã nguồn cấu hình riêng cho từng nền tảng.
  - `test/`: Thư mục chứa mã kiểm thử tự động (Unit / Widget test).

---

## Chương 2: Ngôn Ngữ Lập Trình Dart — Cơ Bản & Nâng Cao (Modules 2 & 3)

Flutter sử dụng ngôn ngữ **Dart** vì Dart là ngôn ngữ đa mục đích nhưng tối ưu riêng cho giao diện người dùng (**General-purpose programming with UI focus**), hỗ trợ hiệu quả cả logic UI lẫn nghiệp vụ (**It supports both UI and application logic efficiently**), kết hợp **JIT** (phát triển nhanh) và **AOT** (chạy production nhanh).

### 2.1. Kiểu dữ liệu, Biến, Hàm & Null Safety (Module 2)
| Khái niệm trong Dart | Mô tả |
| :--- | :--- |
| **Điểm vào chương trình** | Mọi chương trình Dart đều bắt đầu từ hàm `main()`. |
| **Kiểu dữ liệu cốt lõi** | `int`, `double`, `String` (nội suy chuỗi bằng `$var` hoặc `${expr}`), `bool`, `List`, `Set`, `Map`, `Object` (lớp gốc của mọi đối tượng), `enum`, `Iterable`, `void`, `dynamic` (xác định kiểu lúc chạy), `Never` (hàm không bao giờ return mà luôn throw). |
| **`var` vs `dynamic`** | `var`: suy luận kiểu tĩnh 1 lần lúc khai báo.<br>`dynamic`: nhận mọi kiểu dữ liệu, kiểm tra lúc chạy (runtime). |
| **`const` vs `final`** | **`const`**: Hằng số xác định ngay lúc **biên dịch** (**compile time**).<br>**`final`**: Biến chỉ gán 1 lần duy nhất lúc chạy, giá trị cố định sau khi gán (**The variable value is fixed after assignment**). |
| **`List`, `Set`, `Map`** | **`List`**: Tập hợp phần tử **có thứ tự** (**ordered collection of items**).<br>**`Set`**: Tập hợp phần tử **không trùng lặp** (unique).<br>**`Map`**: Lưu các cặp **khoá - giá trị** (**Storing key-value pairs**). |
| **Xử lý Collection dạng hàm** | **`map()`**: biến đổi từng phần tử sang kiểu mới (giữ nguyên độ dài).<br>**`where()`**: lọc phần tử thoả điều kiện.<br>Đều thực thi lười (lazy), gọi **`toList()`** hoặc **`toSet()`** để thu kết quả. |
| **Tham số hàm** | Arrow syntax `=>` cho hàm 1 biểu thức; dùng `{String name = "Guest"}` cho **named optional parameters** có giá trị mặc định. |
| **Null Safety (`?`, `??`, `!`)** | Ngăn chặn lỗi tham chiếu `null` ngay tại **thời điểm biên dịch** (**Null safety**). Biến **non-nullable** chưa khởi tạo → báo lỗi biên dịch (**A compile-time error occurs**). Dùng `?` cho kiểu có thể null, `??` cho giá trị dự phòng, `!` khẳng định khác null. |
| **Xử lý ngoại lệ** | `try` (khối rủi ro), `on SpecificException` (bắt đúng loại lỗi), `catch (e, s)` (lấy lỗi + stack trace), `finally` (luôn chạy để dọn dẹp), `rethrow` (ném tiếp lỗi). Nên tạo **Custom Exception** (`class LoginException implements Exception`). |
| **Packages and imports** | Giúp chia nhỏ và tổ chức mã nguồn thành các thư viện tái sử dụng (**organize code into reusable libraries**). |

### 2.2. Lập trình hướng đối tượng (OOP) & Dart nâng cao (Module 3)
- **OOP cơ bản**: Hỗ trợ qua lớp và đối tượng (**Classes and objects**); `class` là **bản thiết kế để tạo đối tượng** (**A blueprint for creating objects**). Hỗ trợ **Default constructor**, **Named constructor** (ví dụ `Point.origin()`), kế thừa (`extends`) và ghi đè (`@override`).
- **`abstract class`**: Định nghĩa khuôn mẫu chứa phương thức chưa cài đặt, ép lớp con phải hiện thực (trong Flutter, `State<T>` là lớp trừu tượng).
- **Implicit Interfaces**: Mọi `class` trong Dart đều tự động là một interface.

| Từ khoá | Ý nghĩa | Khi nào dùng & Ví dụ trong Flutter |
| :--- | :--- | :--- |
| **`extends`** | Kế thừa cả cấu trúc lẫn hành vi có sẵn. | Mở rộng lớp cha (`StatefulWidget extends Widget`). |
| **`implements`** | Chỉ lấy hợp đồng (signature), bắt buộc ghi đè **toàn bộ** phương thức. | Tự cài đặt hành vi riêng (`AnimationController implements Listenable`). |
| **`with`** | Trộn (**Mixin**) các đoạn code dùng chung mà không cần chuỗi kế thừa. | Chia sẻ hành vi animation, logging, lifecycle. Dùng **`mixin CanBark on Pet`** để giới hạn mixin chỉ gắn được lên lớp con của `Pet`. |

- **Factory Constructors (`factory`)**: Kiểm soát việc tạo đối tượng thay vì lúc nào cũng cấp phát instance mới. Ứng dụng phổ biến: **Singleton** (trả lại instance có sẵn), chuyển đổi dữ liệu (**`User.fromJson(Map)`**), chọn lớp con theo điều kiện.
- **Generics (`<T>`) & Ràng buộc kiểu**: Cho phép viết thành phần tái sử dụng mà vẫn an toàn kiểu dữ liệu lúc biên dịch (**reusable, type-safe components**), tránh lạm dụng `dynamic`. Có thể ràng buộc kiểu con bằng **`class Box<T extends Animal>`**.
- **Collection Operators**: Hỗ trợ **spread (`...base`)**, **collection-if (`if (cond) item`)**, và **collection-for (`for (var x in base) ...`)** ngay bên trong `List`/`Widget` tree.

### 2.3. Lập trình bất đồng bộ, Event Loop & Streams
- **`Future` & `async/await`**: `async` đánh dấu hàm bất đồng bộ; từ khoá **`await`** tạm dừng thực thi hàm cho tới khi `Future` hoàn tất (**pause execution until a Future completes**). Có thể nối chuỗi bằng **Future Chaining (`.then()`)**.
- **Event Loop — Microtask Queue vs Event Queue**:
  - **Microtask Queue (Ưu tiên cao nhất)**: Xử lý tác vụ nội bộ tức thời (`scheduleMicrotask()`), luôn chạy **hết trước** khi Event Queue được xử lý.
  - **Event Queue (Ưu tiên thường)**: Xử lý `Future()`, sự kiện UI, I/O, timer.
  - Thứ tự chạy của `print("A")`, `scheduleMicrotask(() => print("micro"))`, `Future(() => print("future"))`, `print("B")` là: **`A -> B -> micro -> future`**.
- **Streams (Luồng giá trị bất đồng bộ theo thời gian)**:
  - **Single-subscription Stream (mặc định)**: Chỉ có 1 người nghe (`listen`), tiêu thụ tuần tự.
  - **Broadcast Stream (`StreamController.broadcast()`)**: Nhiều listener cùng nghe và chia sẻ chung sự kiện.
  - **Stream Generator**: Dùng **`async*`** kết hợp **`yield`** để phát lần lượt từng giá trị; tiêu thụ bằng **`await for`** hoặc `listen()`, nhớ huỷ bằng `subscription.cancel()`.
- **Isolates**: Dùng để tách các tác vụ tính toán CPU nặng ra khỏi luồng giao diện chính (main isolate) nhằm tránh đơ UI.

---

## Chương 3: Cây Widget, Giao Diện & Bố Cục (Module 4 & Slivers)

### 3.1. Bản chất của Widget và `BuildContext`
- **Vai trò chính của Widget**: Mô tả giao diện người dùng (**Describing the user interface**). Giao diện nội bộ của Flutter được cấu trúc thành **cây phân cấp Widget** (**Using a hierarchical widget tree**).
- **Tại sao Widget rất nhẹ (lightweight) và bất biến (immutable)?**
  - Widget chỉ là **các bản mô tả bất biến** (**They are immutable descriptions**), không trực tiếp giữ pixel vẽ.
  - Cây Widget được coi là **immutable** vì khi đổi giao diện, các Widget sẽ **được tạo mới thay vì sửa đổi trực tiếp** (**Widgets are recreated instead of modified**).
- **Widget Composition (Ghép nối các widget nhỏ)**: Giúp tái sử dụng code đa nền tảng và đảm bảo sự đồng nhất giao diện (**Widgets allow code reuse across platforms** / **Better code reuse and UI consistency**).
- **Phương thức `build()`**: Trả về một cây widget mô tả giao diện (**A widget tree describing the UI**).
- **Hiểu vòng đời Widget (Widget lifecycle)**: Giúp quản lý việc cập nhật giao diện chính xác (**Manage UI updates correctly**).
- **`BuildContext`**: Xác định vị trí của một widget bên trong cây widget (**Locate widgets in the widget tree**).

### 3.2. Các Widget nền tảng, Tương tác, Bố cục & Cuộn trang
| Nhóm | Tên Widget / Thuộc tính | Chức năng |
| :--- | :--- | :--- |
| **Khung App & Theme** | **`MaterialApp`** | Widget gốc phổ biến của ứng dụng (**root of a Flutter app**), áp dụng **Theme cho toàn bộ ứng dụng** (**applies a theme to an entire Flutter application**). |
| | **`Scaffold`** | Khung cấu trúc nền tảng của một màn hình Material Design (**structural foundation of a Material Design screen** — chứa `AppBar`, `Body`, `FloatingActionButton`, `BottomNavigationBar`, `Drawer`...). |
| | **`ThemeData` & Dark Mode** | Định nghĩa phong cách hiển thị xuyên suốt toàn ứng dụng (**Define application-wide visual styles**). Thời điểm tuỳ chỉnh Theme hợp lý nhất là trong **pha thiết kế UI/UX** (**During UI/UX design phase**). Chuyển sáng/tối bằng `darkTheme` và `themeMode`. |
| **Hiển thị & Điều hướng dưới** | **`Image` + `BoxFit`** | `Image.network` / `Image.asset` hiển thị ảnh kèm chế độ co giãn `BoxFit`. |
| | **`Card` + `ListTile` + `CircleAvatar`** | Mẫu giao diện Material để hiển thị thông tin gọn gàng dạng danh sách (phim, liên hệ, sản phẩm). |
| | **`BottomNavigationBar`** | Thanh điều hướng dưới đáy hiển thị **2–5 tab** để chuyển nhanh giữa các màn hình chính. |
| **Nhập liệu & Chọn lựa** | **`Switch` / `Slider` / `RadioListTile`** | `Switch`: bật/tắt boolean (ON/OFF); `Slider`: chọn giá trị liên tục trong khoảng; `RadioListTile`: chọn 1 phương án trong nhóm. |
| | **`showDatePicker` / `showTimePicker`** | Hộp thoại Material chọn ngày và chọn giờ (ứng dụng đặt lịch, đặt vé). |
| **Bố cục cơ bản** | **`Container`** | Dùng để bố cục, trang trí kiểu dáng và định vị (**Layout, styling, and positioning**). |
| | **`Padding` & `SizedBox`** | `Padding`: thêm khoảng trống **bên trong** widget (**Adds space inside a widget**). `SizedBox`: cách tốt nhất tạo khoảng trống kích thước cố định (**add fixed empty space**). |
| | **`Column` & `Row`** | `Column` xếp con theo **chiều dọc** (**arrange children vertically**) nên **`crossAxisAlignment`** điều khiển **căn lề ngang** (**Horizontal alignment in Column**). |
| | **`Stack`** | Cho phép các widget con **xếp chồng đè lên nhau** (**overlapping of its child widgets**), định vị bằng `Positioned`. |
| | **`ListView` & `GridView`** | `ListView.builder` / `ListView.separated` tối ưu danh sách dài; `GridView` hiển thị dạng **lưới** (**grid layout**). |
| **Cuộn nâng cao (Slivers)** | **`CustomScrollView`** | Bật hiệu ứng cuộn tuỳ biến (**custom scroll effects**) và cho phép danh sách cuộn tương tác mượt với thanh tiêu đề (**allows both scrolling and app bars to interact**). |
| | **`SliverAppBar` & `SliverList`** | `SliverAppBar`: thanh tiêu đề co giãn/ẩn hiện khi cuộn (**Scrollable flexible app bar**). `SliverList`: hiển thị danh sách cuộn dọc bên trong `CustomScrollView` (**display a scrolling list**). |

### 3.3. Lỗi bố cục cơ bản hay gặp & Cách khắc phục (Module 4)
- **`ListView` đặt trong `Column` bị lỗi chiều cao vô hạn** → Bọc `ListView` trong **`Expanded`**.
- **Tràn màn hình (Overflow) trên thiết bị nhỏ** → Dùng **`Flexible`** hoặc bọc trong **`SingleChildScrollView`**.
- **Giao diện không tự cập nhật sau tương tác** → Quên gọi **`setState()`**.
- **Gọi DatePicker / TimePicker / SnackBar thất bại** → Thiếu hoặc truyền sai **`BuildContext`** hợp lệ (nằm ngoài `MaterialApp`/`Scaffold`).

---

## Chương 4: Giao Diện Đáp Ứng & Thích Ứng (Module 6 — Responsive & Adaptive UI)

### 4.1. Phân biệt Responsive UI và Adaptive UI
- **Responsive UI (Đáp ứng)**: Bố cục tự co giãn theo **không gian màn hình khả dụng** (ví dụ: đổi `Column -> Row`, đổi `GridView` từ 2 cột lên 4 cột, tăng giảm padding theo bề rộng).
- **Adaptive UI (Thích ứng)**: Giao diện thay đổi thành phần phù hợp với **loại thiết bị / hệ điều hành** (ví dụ: dùng `BottomNavigationBar` trên điện thoại → đổi sang **`NavigationRail`** trên tablet, `Drawer` → **Sidebar** trên desktop).

### 4.2. Các công cụ & Widget xây dựng Responsive UI
| Công cụ / Widget | Vai trò & Cách dùng |
| :--- | :--- |
| **`MediaQuery`** | Lấy thông tin **toàn màn hình** thiết bị: chiều rộng (`MediaQuery.of(context).size.width`), chiều cao, hướng xoay, vùng an toàn (`padding`), mật độ điểm ảnh. Thường kết hợp **Breakpoints** (ví dụ: `< 400px` Small, `400–800px` Medium, `> 800px` Large; hoặc `< 600px` Mobile vs Tablet). |
| **`LayoutBuilder`** | Cung cấp **ràng buộc kích thước từ widget cha (`constraints.maxWidth`)**, không phải toàn màn hình — rất hữu ích cho từng thẻ/component tái sử dụng ở nhiều vị trí khác nhau. |
| **`OrientationBuilder`** | Phát hiện thiết bị xoay dọc (**`Orientation.portrait`**) hay xoay ngang (**`Orientation.landscape`**) để đổi bố cục 1 cột sang 2 cột. |
| **`SafeArea`** | Tự động chừa khoảng trống an toàn tránh bị che bởi tai thỏ (notch), Dynamic Island, thanh trạng thái hoặc cạnh cong. |
| **`Expanded` & `Flexible`** | Chia tỷ lệ linh hoạt trong `Row`/`Column` và chống lỗi tràn màn hình (overflow). |
| **`Wrap`** | Tự động xuống dòng khi hết chiều ngang (dùng `spacing`, `runSpacing`) — **ưu tiên hơn `Row`** khi hiển thị danh sách `Chip` / thẻ thể loại. |
| **`AspectRatio` & `FractionallySizedBox`** | `AspectRatio` giữ tỷ lệ khung hình ảnh tránh bị méo/kéo giãn; `FractionallySizedBox` đặt kích thước theo phần trăm widget cha. |
| **`GridView.count`** | Điều chỉnh số cột (`crossAxisCount`) theo độ rộng màn hình (Mobile: 2 cột, Tablet: 3–4 cột, Desktop: 5–6 cột). |

- **Thực hành tốt**: Tránh hardcode kích thước cố định; kiểm thử trên nhiều kích thước màn hình; dùng **Flutter Inspector → Layout Explorer** để soi ràng buộc bố cục.

---

## Chương 5: Biểu Mẫu & Kiểm Tra Dữ Liệu (Module 7 — Forms & Validation)

- **Vai trò của Form**: Thu thập dữ liệu từ người dùng (**User data collection**). Thiết kế tốt cần **nhãn rõ ràng và phản hồi trực quan** (**Clear labels and feedback**).
- **Phân biệt `TextField` vs `TextFormField`**:
  - **`TextField`**: Dùng cho ô nhập liệu đơn lẻ đơn giản (ví dụ thanh tìm kiếm); cấu hình **`obscureText: true`** để ẩn ký tự mật khẩu (**hide user input text when configured for password entry**), chọn **`TextInputType.emailAddress`** cho bàn phím email (hiện sẵn phím `@`).
  - **`TextFormField`**: Dùng bên trong widget **`Form`** khi cần tích hợp cơ chế kiểm tra hợp lệ (`validator`) và lưu dữ liệu (`onSaved`).
- **`GlobalKey<FormState>` và 3 phương thức cốt lõi**:
  - `formKey.currentState!.validate()`: Chạy toàn bộ hàm `validator` của các ô nhập; nếu thất bại thì hiển thị lỗi ngay bên dưới từng ô (**Error messages are shown**).
  - `formKey.currentState!.save()`: Kích hoạt **`onSaved` callback** trên từng trường để lưu giá trị (**Store form values**).
  - `formKey.currentState!.reset()`: Đặt lại toàn bộ các trường trong form về trạng thái ban đầu (**resets all form fields**).
- **`TextEditingController`**: Quản lý và đọc/ghi giá trị văn bản đang nhập (**Text input value**).
- **Quy ước hàm `validator(String? value)`**: Trả về **`null`** nếu hợp lệ; trả về chuỗi thông báo lỗi (`String`) nếu không hợp lệ.
- **3 chế độ `AutovalidateMode`**:
  - `AutovalidateMode.disabled`: Chỉ kiểm tra khi bấm Submit.
  - `AutovalidateMode.always`: Kiểm tra ngay từ lúc mở màn hình (dễ gây khó chịu vì hiện lỗi đỏ quá sớm).
  - **`AutovalidateMode.onUserInteraction`** *(Khuyên dùng)*: Chỉ kiểm tra sau khi người dùng tương tác với ô nhập đó.
- **Quản lý Focus & Trải nghiệm bàn phím di động**:
  - Dùng **`FocusNode`**, **`textInputAction`** (`TextInputAction.next` / `done`), **`onFieldSubmitted`** và `FocusScope.of(context).requestFocus(nextNode)` để chuyển ô mượt mà.
  - Bọc form bằng **`GestureDetector`** để chạm ra ngoài sẽ ẩn bàn phím (`FocusScope.of(context).unfocus()`), đồng thời đặt form trong **`ListView` hoặc `SingleChildScrollView`** để bàn phím không che nút Submit và không gây overflow.
- **Async Validation**: Kiểm tra bất đồng bộ với server (ví dụ kiểm tra email/username đã tồn tại hay chưa) — cần bật trạng thái loading và **vô hiệu hoá nút Submit** trong lúc chờ kết quả để tránh gửi trùng.

---

## Chương 6: Điều Hướng Màn Hình & Deep Linking (Module 5 — Navigation)

- **Cơ chế hoạt động của `Navigator`**: Quản lý các màn hình theo cấu trúc **Ngăn xếp — Stack** (**Screens are managed using a stack**), mỗi màn hình là một `Route` (thường dùng **`MaterialPageRoute`**).
- **Các phương thức cốt lõi của `Navigator`**:

| Phương thức | Chức năng |
| :--- | :--- |
| **`Navigator.push()`** | Đẩy một màn hình mới lên đỉnh ngăn xếp. |
| **`Navigator.pop()`** | Đóng màn hình hiện tại để quay về màn hình trước (**Close current screen**). |
| **`Navigator.pushReplacement()`** | Thay thế màn hình hiện tại bằng màn hình mới (thường dùng sau Login để bấm Back không quay lại trang Login). |
| **`Navigator.pushNamed()` / `pushReplacementNamed()`** | Điều hướng dựa theo tên đường dẫn định nghĩa trước (Named Routes / `onGenerateRoute`). |
| **`Navigator.maybePop()`** | Chỉ pop nếu ngăn xếp còn màn hình phía dưới để quay lại. |

- **Tại sao phải truyền `context` khi điều hướng?** Để tìm và truy cập đối tượng `Navigator` gần nhất trong cây widget (**Access Navigator**).
- **Truyền dữ liệu sang màn hình mới**: Truyền qua **tham số hàm khởi tạo** của Widget màn hình đích (**Via constructor arguments**).
- **Navigator 1.0 vs Navigator 2.0**:
  - **Navigator 1.0 (Imperative — mệnh lệnh)**: Gọi `push()` và `pop()` trực tiếp theo thao tác.
  - **Navigator 2.0 (Declarative — khai báo)**: Mô tả trực tiếp ngăn xếp màn hình mong muốn dựa trên **App State**, phản ứng tốt với thay đổi URL và Web/Deep Linking.
- **Deep Linking (Liên kết sâu)**: Mở thẳng một màn hình cụ thể (ví dụ trang chi tiết phim) từ URL bên ngoài:
  - **Android**: Khai báo `<intent-filter>` với `<data android:scheme="..." android:host="..." />` trong `AndroidManifest.xml`, kiểm thử bằng `adb shell am start -a android.intent.action.VIEW -d "..."`.
  - **iOS**: Bật capability **Associated Domains** (`applinks:...`) trong Xcode và khai báo **URL Schemes** trong `Runner/Info.plist`.
- **Route Guard (`Guard` pattern)**: Mẫu thiết kế kiểm tra đăng nhập và bảo vệ các đường dẫn cần xác thực (**protects authenticated routes**).
- **Tại sao cần tổ chức logic điều hướng rõ ràng?** Để dễ bảo trì mã nguồn (**Improve maintainability**).

---

## Chương 7: Quản Lý Trạng Thái (Module 5 — State Management)

> **Mô hình Giao diện Phản ứng (Reactive UI Model):** Flutter không sửa từng ô chữ thủ công, mà **dựng lại (rebuild) giao diện tự động để phản ứng khi State thay đổi** (**Rebuilding UI in response to state changes** / **When state changes**). Quản lý state kém dẫn tới rủi ro lớn nhất là **giao diện thiếu nhất quán** (**UI inconsistency**).

### 7.1. Stateless vs Stateful, `setState` & State Hoisting
| Loại Widget | Tự rebuild khi state đổi? | Trường hợp sử dụng |
| :--- | :--- | :--- |
| **`StatelessWidget`** | Không | Giao diện tĩnh: Logo, nhãn văn bản cố định, tiêu đề. |
| **`StatefulWidget`** | Có (qua **`setState()`**) | Giao diện có tương tác: Form, bộ đếm, danh sách thay đổi. |

- **`setState()`**: Kích hoạt dựng lại cây widget (**Trigger widget rebuild** / **The widget tree is rebuilt**) để phản ánh dữ liệu mới.
- **Nguyên tắc sử dụng**:
  - Giữ state **cục bộ nhất có thể** (**keep state as local as possible**) để giảm rebuild dư thừa (**Reduce unnecessary rebuilds**).
  - Không lạm dụng `setState()` ở widget cha quá lớn vì **lạm dụng `setState()` gây rebuild không cần thiết** (**Overusing setState()** / **It may trigger unnecessary rebuilds**).
  - Tách riêng UI và logic trạng thái giúp **dễ bảo trì hơn** (**Improve maintainability**).
- **State Hoisting / Lifting State Up (Đưa state lên widget cha chung)**: Chia sẻ trạng thái giữa nhiều widget con, giải quyết bài toán **trùng lặp trạng thái** (**State duplication**).

### 7.2. `InheritedWidget`, `Provider`, `BLoC` & `Cubit`
- **`InheritedWidget`**: Cơ chế nền tảng của Flutter cho phép truyền dữ liệu xuống sâu trong cây widget qua `context.dependOnInheritedWidgetOfExactType<T>()` mà không phải truyền tay qua từng cấp constructor.
- **`Provider`** (xây dựng trên `InheritedWidget`):
  - **Khi nào chọn `Provider` thay vì `setState()`?** Khi cần chia sẻ trạng thái dùng chung hoặc toàn cục qua nhiều màn hình (**For global or shared state**).
  - Cách triển khai: lớp trạng thái kế thừa/trộn **`ChangeNotifier`** (gọi **`notifyListeners()`** khi đổi dữ liệu) → cung cấp bằng **`ChangeNotifierProvider`** → lắng nghe UI bằng **`Consumer<T>`** hoặc **`Selector<T>`** *(ưu tiên `Selector` thay vì `context.watch<T>()` để chỉ rebuild đúng phần dữ liệu đổi)*.
- **BLoC (`Business Logic Component`)** — Kiến trúc mở rộng mạnh cho dự án/nhóm lớn:
  - **Tại sao hợp với nhóm lớn (large teams)?** Vì có **kiến trúc chuẩn hoá rõ ràng** (**Standardized architecture**).
  - **Nền tảng cốt lõi**: Luồng dữ liệu bất đồng bộ **`Stream`**, hỗ trợ bởi gói **`flutter_bloc`**.
  - **Đầu vào (`Events`)**: Kích hoạt sự thay đổi trạng thái (**Trigger state changes**).
  - **Đầu ra (`States`)**: Biểu diễn trạng thái giao diện trả ra từ BLoC (**States**). State trong BLoC phải **bất biến (`immutable`)** để thay đổi minh bạch, dễ dự đoán (**Predictable state changes**).
- **`Cubit`**: Phiên bản BLoC rút gọn, gọi hàm trực tiếp để phát State mới mà **không cần lớp Event** (**Simplified BLoC without events**).

---

## Chương 8: Mạng, RESTful API & JSON (Module 8)

- **`REST` viết tắt của**: **Representational State Transfer**. Định dạng dữ liệu phổ biến nhất là **`JSON`** (ánh xạ tự nhiên sang `Map<String, dynamic>` và `List<dynamic>` trong Dart).
- **Mục đích của Parsing JSON & Ánh xạ vào Model (Mapping to models)**: Chuyển chuỗi JSON thành đối tượng Dart (**Convert JSON into Dart objects**) nhằm **đảm bảo an toàn kiểu dữ liệu** (**Ensure type safety**) và dễ bảo trì. Quy trình chuyển mảng JSON: `jsonDecode()` → `.map((e) => Model.fromJson(e))` → `.toList()`.
- **Phương thức HTTP & Nhóm mã trạng thái**:
  - **`GET`**: Lấy dữ liệu (**retrieve data**) · **`POST`**: Gửi/tạo dữ liệu mới (**send new data to a server**) · **`PUT`**: Cập nhật · **`DELETE`**: Xoá.
  - **`200–299`**: Thành công (**`200` Success**) · **`400–499`**: Lỗi phía client (**`401` Unauthorized**, **`404` Resource not found**) · **`500–599`**: Lỗi phía máy chủ (**`500` Server error**).
- **Sử dụng gói `http`**: Khai báo trong `pubspec.yaml`, gọi `http.get(Uri.parse(url))` và `http.post(Uri.parse(url), body: ...)`. Mọi thao tác mạng đều phải bất đồng bộ (`async/await`) để không làm đơ UI.
- **Phân biệt `FutureBuilder` và `StreamBuilder`**:
  - **`FutureBuilder`**: Cho tác vụ bất đồng bộ **trả về 1 lần** như gọi REST API hoặc đọc dữ liệu cục bộ (**asynchronous API responses** / **async data from local storage**). Cần xử lý đủ **4 trạng thái UI**: đang tải (`ConnectionState.waiting` → spinner), lỗi (`snapshot.hasError` → thông báo + nút **Retry**), rỗng (`!snapshot.hasData`), và có dữ liệu (`ListView`).
  - **`StreamBuilder`**: Cho luồng dữ liệu **thay đổi liên tục theo thời gian** như trạng thái đăng nhập (**reacts to authentication state changes**).
- **Service Layer Pattern & Các lỗi hay gặp**:
  - Gom toàn bộ logic gọi HTTP vào lớp dịch vụ riêng (`ApiService`) để tách biệt khỏi UI và tập trung quản lý base URL.
  - **Không gọi API trực tiếp bên trong hàm `build()`** — hãy gọi một lần trong **`initState()`** để tránh gọi lặp mỗi khi widget rebuild.
  - Khi gửi POST, vô hiệu hoá nút gửi trong lúc đang loading để **tránh double-submit**.
- **Pagination (Phân trang)**: Tải từng phần nhỏ để **xử lý tập dữ liệu lớn hiệu quả** (**Handling large datasets efficiently**).
- **Công cụ debug request mạng**: **Flutter DevTools** (tab Network).

---

## Chương 9: Lưu Trữ Cục Bộ & Offline-First (Module 9)

### 9.1. So sánh các giải pháp lưu trữ cục bộ trong Flutter
| Giải pháp | Phù hợp cho | Phương thức & Ghi chú quan trọng |
| :--- | :--- | :--- |
| **`shared_preferences`** | Dữ liệu **key-value nguyên thuỷ đơn giản** (**Simple primitive values**: `int`, `bool`, `double`, `String` — như Dark mode, cờ onboarding, bộ lọc mặc định). | - Khởi tạo: `SharedPreferences.getInstance()`.<br>- Lưu số nguyên: **`setInt()`** *(không nhầm với `putInt()` của Android gốc)*; lưu bool: `setBool()`; đọc chung: **`get()`**.<br>- Hỗ trợ Android/iOS và Flutter Web (ánh xạ sang `localStorage`), **không chạy trên DartPad**.<br>- **Hạn chế**: Không phù hợp cho dữ liệu lớn hoặc cấu trúc phức tạp (**Not suitable for large or complex data**). |
| **Local JSON File (`path_provider` + `dart:io`)** | Danh sách nhỏ, ghi chú, xuất/nhập JSON, cache phản hồi API. | Dùng `path_provider` lấy thư mục ứng dụng, `File(path).writeAsString()` / `readAsString()` kết hợp `json.encode` / `json.decode`. |
| **`Hive`** | Cơ sở dữ liệu **NoSQL cục bộ gọn nhẹ**, tốc độ cao (**Lightweight local NoSQL storage**). | Lưu đối tượng linh hoạt, không cần câu lệnh SQL. |
| **`sqflite` (SQLite)** | Dữ liệu **lớn, có cấu trúc bảng (hàng/cột) và quan hệ 1–N, N–N** cần lọc/sắp xếp (To-Do, giỏ hàng offline). | - Plugin cung cấp hỗ trợ **SQLite** cho Flutter (**SQLite support**).<br>- **Phân biệt**: **SQLite** là engine CSDL, còn **SQFlite** là plugin cầu nối của Flutter (chỉ chạy Android/iOS, **không chạy trên Web**).<br>- Vòng đời & CRUD: `openDatabase()`, `onCreate` (`CREATE TABLE`), `insert()`, `query()`, `update()`, `delete()`.<br>- Câu lệnh SQL hay dùng: `SELECT`, `FROM`, `WHERE`, `GROUP BY + HAVING`, `ORDER BY`, `LIMIT / OFFSET` (phân trang). |

### 9.2. Nguyên tắc thiết kế lưu trữ & Offline-First
- **Tại sao mọi thao tác Database phải bất đồng bộ (`asynchronous`)?** Để **tránh làm đơ luồng giao diện chính** (**Avoid blocking UI thread**).
- **Repository Pattern**: Tách biệt logic lưu trữ/nguồn dữ liệu ra khỏi tầng UI (**separates storage logic from UI**), giúp dễ kiểm thử (dễ mock) và dễ đổi nguồn dữ liệu.
- **Chiến lược Offline-First**: Ứng dụng vẫn hoạt động ổn định khi mất mạng theo quy trình **Nạp dữ liệu cục bộ trước → Dùng offline → Đồng bộ lên server khi có mạng** (kèm xử lý xung đột dữ liệu và thời hạn cache).

---

## Chương 10: Xác Thực, Quản Lý Phiên & Thông Báo (Module 10)

### 10.1. Xác thực, Phân quyền & JWT
- **Mục đích cốt lõi của xác thực an toàn**: Bảo vệ dữ liệu người dùng (**Protect user data**).
- **Authentication vs Authorization**:
  - **Authentication (Xác thực)**: Xác minh *bạn là ai?* (đăng nhập bằng email/mật khẩu, OAuth).
  - **Authorization (Phân quyền)**: Xác định *bạn được phép làm gì?* (vai trò user/admin, quyền truy cập tài nguyên).
- **Token-based Authentication & JWT (JSON Web Token)**:
  - **Access Token**: Chứng thực quyền truy cập tạm thời (**Temporary access credential**), đính kèm vào HTTP Header **`Authorization`**.
  - **Refresh Token**: Dùng để **gia hạn phiên đăng nhập mà không bắt người dùng đăng nhập lại** (**Extend session without re-login**).
  - **Cấu trúc JWT gồm 3 phần** (`Header.Payload.Signature`): **Header** (thuật toán, loại token), **Payload** (user ID, email, role, thời hạn), **Signature** (chữ ký xác minh tính toàn vẹn). Lưu ý: JWT được **mã hoá Base64 và ký số (signed), KHÔNG phải mã hoá bí mật (not encrypted)** nên không nhét mật khẩu vào payload.

### 10.2. Vòng đời phiên đăng nhập (Session) & Firebase Auth
- **Quản lý phiên & Auto-Login**:
  - Sau khi đăng nhập thành công: **Phiên làm việc bắt đầu** (**User session starts**), lưu token cục bộ để duy trì giữa các lần mở app.
  - Luồng xử lý: **`SplashScreen` -> kiểm tra token đã lưu -> có token vào `Home`, không có vào `Login`**. Dùng `pushReplacementNamed()` để chặn người dùng bấm Back quay lại trang Login.
  - Phiên kết thúc khi: **Đăng xuất (`Logout`)** (**End user session securely** — xoá token đã lưu), token hết hạn, hoặc server trả về **`401 Unauthorized`**.
  - **Tập trung hoá trạng thái xác thực (Centralized auth state)**: Đảm bảo kiểm soát quyền truy cập nhất quán trên toàn bộ màn hình (**Ensure consistent access control**).
- **Firebase Authentication & Google Sign-In**:
  - Dịch vụ đám mây tích hợp nhanh đăng nhập Email/Password, Google, Apple, Facebook, tự động duy trì phiên và làm mới token.
  - **Cấu hình bắt buộc cho Google Sign-In trên Android**: Tạo dự án Firebase → đăng ký đúng package name → thêm **SHA-1 & SHA-256** → tải `google-services.json` đặt vào `android/app/` → thêm `firebase_core`, `firebase_auth`, `google_sign_in`.
  - **Lỗi Google Sign-In hay gặp**: Không hiện màn hình chọn tài khoản (thiếu SHA-1), lỗi `DEVELOPER_ERROR` (sai package name), crash lúc khởi động (thiếu plugin Gradle `com.google.gms.google-services`), trả về `null` (emulator không có Google Play Services).
- **Thực hành bảo mật**: Luôn truyền tải qua **`HTTPS`**, mã hoá thông tin xác thực lưu trữ (**Encrypting credentials** / dùng secure storage thay vì lưu thô), băm & trộn muối (hash & salt) mật khẩu ở server.

### 10.3. Thông báo trong ứng dụng di động (Notifications)
Thông báo là thông điệp cấp hệ thống hiển thị bên ngoài UI app để báo sự kiện quan trọng (đăng nhập thành công, nhắc lịch, cảnh báo tài khoản).

| Tiêu chí | Local Notification (`flutter_local_notifications`) | Push Notification (ví dụ FCM) |
| :--- | :--- | :--- |
| **Nguồn kích hoạt** | Tự kích hoạt từ ngay bên trong ứng dụng trên thiết bị | Gửi từ máy chủ (backend server) |
| **Yêu cầu Internet & Backend** | **Không cần** mạng và không cần backend | **Bắt buộc** có Internet và backend |
| **Độ phức tạp** | Đơn giản, dễ tích hợp | Phức tạp hơn (quản lý token thiết bị, server gửi) |

---

## Chương 11: Hoạt Ảnh (Animations)

- **Implicit Animation (Hoạt ảnh ngầm định)**: Tự động chuyển động khi thuộc tính thay đổi mà **không cần tạo `AnimationController`** (**Animation without controller**).
  - **`AnimatedContainer`**: Ví dụ kinh điển của Implicit Animation (tự mượt khi đổi màu, kích thước, padding...).
  - **`AnimatedSwitcher`**: Tạo hiệu ứng chuyển cảnh mượt **giữa 2 widget khác nhau** (**animates between two widgets**).
- **Explicit Animation (Hoạt ảnh tường minh — điều khiển chi tiết)**:
  - **`Tween`**: Định nghĩa **khoảng giá trị bắt đầu và kết thúc** của hoạt ảnh (**Value range for animation**).
  - **`CurvedAnimation`**: Quy định đường cong gia tốc/nhịp điệu của hoạt ảnh (**Animation curve behavior**). Đường cong tạo hiệu ứng nảy như quả bóng là **`bounceOut`**.
  - **`AnimatedBuilder`**: Widget tự động dựng lại theo từng nhịp giá trị của animation (**rebuilds automatically during animation**).
  - **`v-sync` (`TickerProvider`)**: Đồng bộ nhịp vẽ với tần số quét màn hình để **tối ưu tài nguyên hoạt ảnh** (**Optimize animation resources**), tránh chạy ngầm khi khuất màn hình.
  - **Tại sao bắt buộc phải `dispose()` AnimationController?** Để **ngăn chặn rò rỉ bộ nhớ** (**Prevent memory leaks**).

---

## Chương 12: Kiến Trúc Phần Mềm, Kiểm Thử & Gỡ Lỗi (Module 11)

### 12.1. Quy trình, Kiến trúc phần mềm & Git
- **Pha phân tích (`Analysis` phase)**: Giai đoạn thu thập và làm rõ yêu cầu phần mềm (**gathering requirements**).
- **Mục đích của App Architecture**: Tổ chức cấu trúc mã nguồn ngăn nắp (**Organize code structure**). Nên **quyết định kiến trúc từ sớm** để **giảm chi phí đập đi viết lại** (**Reduce refactoring cost**).
- **Clean Architecture**: Tách biệt rõ các tầng (`UI -> Provider/BLoC -> Repository -> Data`) giúp **dễ bảo trì và kiểm thử độc lập** (**Easier maintenance and testing**).
- **Technical Debt (Nợ kỹ thuật)**: Chi phí phải trả trong tương lai do những quyết định thiết kế vội vàng/chưa tốt hiện tại (**Future cost of poor design decisions**).
- **Version Control (`Git`)**: Công cụ bắt buộc để **theo dõi và quản lý lịch sử thay đổi mã nguồn** (**Track and manage code changes**).

### 12.2. Kiểm thử & Gỡ lỗi trong Flutter (Gói `flutter_test`)
- **Mục tiêu chính của kiểm thử**: Đảm bảo chất lượng và tính đúng đắn của ứng dụng (**Ensure app quality and correctness**).
- **Tại sao cần test khi Refactoring?** Đảm bảo việc tái cấu trúc code không làm hỏng tính năng cũ (**Ensure changes don't break functionality**).
- **Test Isolation (Cô lập kiểm thử)**: Đảm bảo các ca kiểm thử chạy hoàn toàn độc lập, không ảnh hưởng lẫn nhau (**Independence of test cases**).
- **Mô hình AAA khi viết test**: **Arrange** (chuẩn bị dữ liệu/môi trường) → **Act** (thực thi hàm hoặc giả lập thao tác) → **Assert** (kiểm chứng kết quả bằng `expect()`).
- **Thao tác cốt lõi trong Widget & Navigation Test**:
  - Tìm widget bằng `find.text(...)`, `find.byKey(...)` *(nên gắn `Key` cho widget quan trọng)*; giả lập tương tác bằng `tester.enterText(...)`, `tester.tap(...)`.
  - **`tester.pump()`**: Kích hoạt dựng lại **1 khung hình** ngay sau thao tác.
  - **`tester.pumpAndSettle()`**: Chờ toàn bộ **animation và quá trình chuyển màn hình** hoàn tất trước khi `expect()`.
- **Gỡ lỗi (Debugging)**: Các lỗi như **UI Overflow** không làm crash app nên cần kết hợp test và **Flutter DevTools** để phát hiện lỗi bố cục, lỗi không cập nhật state, rebuild dư thừa và lỗi điều hướng.

| Cấp độ Tháp Kiểm Thử (Testing Pyramid) | Phạm vi & Vấn đề phát hiện | Tốc độ & Tần suất |
| :--- | :--- | :--- |
| **1. `Unit test`** *(Đáy tháp — nhiều nhất)* | Kiểm tra từng hàm/lớp logic đơn lẻ (**individual functions or classes**), phát hiện sớm lỗi logic (mock Repository khi cần). | **Chạy nhanh nhất** (**runs fastest**), ổn định, rẻ. |
| **2. `Widget test`** *(Giữa tháp — vừa phải)* | Kiểm tra hiển thị, tương tác UI (**focuses on UI components**), kiểm tra rebuild và điều hướng màn hình. *(Gồm cả **Golden testing** so sánh ảnh mẫu để đảm bảo đồng nhất diện mạo — **UI appearance consistency**)*. | Nhanh vừa phải. |
| **3. `Integration test`** *(Đỉnh tháp — ít nhất)* | Kiểm tra toàn bộ luồng người dùng đầu-cuối (**End-to-end app behavior**, ví dụ luồng CRUD đầy đủ qua nhiều màn hình). | Chậm và tốn công nhất → nên **dùng số lượng ít nhất** (**used the least**). |

---

## Chương 13: Tối Ưu Hiệu Năng & Phát Hành Ứng Dụng (Module 12)

### 13.1. Ngân sách khung hình, DevTools & Kỹ thuật tối ưu hiệu năng
- **Mục tiêu cốt lõi**: Đảm bảo giao diện mượt mà và phản hồi tức thì (**Ensure smooth and responsive UI**).
- **Ngân sách khung hình (Frame Budget)**: Màn hình **60 FPS** chỉ có **16.6 ms/frame**, màn hình **120 FPS** chỉ có **8 ms/frame** — vượt ngưỡng này sẽ gây giật khung hình (jank/stutter).
- **Flutter DevTools — Công cụ chẩn đoán hiệu năng**:
  - **Performance**: Theo dõi biểu đồ FPS và thời gian dựng từng frame.
  - **CPU Profiler**: Tìm điểm nghẽn tiêu tốn CPU.
  - **Memory**: Phát hiện rò rỉ bộ nhớ (memory leaks) và cấp phát bất thường.
  - **Widget Inspector & Rebuild Tracker**: Xác định nguồn gốc widget bị rebuild quá nhiều.
  - **Repaint Rainbow**: Tô màu các vùng đang bị vẽ lại liên tục.
  - **Lưu ý quan trọng**: Luôn đo hiệu năng ở **Profile Mode (`flutter run --profile`)**, **không đo ở Debug Mode** vì Debug Mode chứa nhiều chi phí gỡ lỗi.
- **Các kỹ thuật tối ưu hiệu năng trọng tâm**:
  1. **Dùng `const` widgets**: Cho phép Flutter bỏ qua bước dựng lại và tiết kiệm bộ nhớ (**They reduce rebuild cost**).
  2. **Thu hẹp phạm vi rebuild (Rebuild scope optimization)**: Chỉ dựng lại đúng widget bị ảnh hưởng (**Limiting rebuild to affected widgets**), dùng **`Selector<T>`** thay cho `context.watch<T>()` đặt ở đầu màn hình.
  3. **Tách nhỏ widget (Splitting / Extracting widgets)**: Tách từng mục danh sách (ví dụ `TaskTile`) thành widget riêng thay vì viết gọn hết vào `build()` khổng lồ (**improves rendering performance**).
  4. **Cập nhật trạng thái hạt mịn (Fine-grained state updates)**: Giữ state gần nơi sử dụng để giảm rebuild không cần thiết (**reduce unnecessary widget rebuilds**).
  5. **`RepaintBoundary`**: Cô lập vùng vẽ để không vẽ lại các phần UI không đổi (**avoid rebuilding/repainting unchanged UI parts**).
  6. **Tuyệt đối không làm việc nặng trong `build()`**: Không sort danh sách, không parse JSON, không gọi API hay đọc DB bên trong `build()`.
  7. **Dùng `Key` đúng cách**: Dùng **`ValueKey(id)`** để bảo toàn state và tối ưu so khớp danh sách; tránh **`UniqueKey()`** (ép rebuild mỗi frame) và hạn chế lạm dụng **`GlobalKey`** (chậm).
  8. **Tối ưu ảnh & Danh sách**: Dùng `ListView.builder` cho danh sách dài; resize/nén ảnh đúng kích thước hiển thị (tránh nạp ảnh 2000px cho ô 50px); dùng **`precacheImage()`** và **`FadeInImage.assetNetwork()`**; không decode ảnh trong `build()`.
- **Tại sao phần tối ưu chuyên sâu (Ch.13) được xếp là mở rộng (Optional / Plus)?** Vì ứng dụng thông thường vẫn hoạt động đúng mà chưa cần tối ưu sâu (**Apps can work without deep optimization**).

### 13.2. Phân tích dung lượng, 3 chế độ chạy & Phát hành ứng dụng (Deployment)
- **So sánh 3 chế độ chạy của Flutter**:
  - **Debug Mode**: Dùng JIT, bật Hot Reload, có biểu ngữ debug, chưa tối ưu tốc độ.
  - **Profile Mode (`flutter run --profile`)**: Hiệu năng gần với bản release, tắt chi phí debug, dùng để đo FPS và soi DevTools trước khi phát hành.
  - **Release Mode**: Biên dịch AOT tối ưu tốc độ và dung lượng, tắt Hot Reload và biểu ngữ debug, sẵn sàng phân phối tới người dùng cuối (**Prepare app for distribution**).
- **Phân tích & giảm dung lượng ứng dụng**:
  - Lệnh phân tích chi tiết: **`flutter build apk --analyze-size`** (xuất báo cáo mã Dart AOT, thư viện native, assets, packages).
  - Mẹo giảm dung lượng: Xoá asset không dùng, nén ảnh, bỏ thư viện thừa khỏi `pubspec.yaml`, bật **icon tree-shaking**.
- **Quy trình đóng gói & phát hành Android**:
  1. Cập nhật phiên bản trong `android/app/build.gradle`: **`versionCode`** (số nguyên **bắt buộc tăng** sau mỗi lần phát hành) và **`versionName`** (chuỗi phiên bản hiển thị cho người dùng).
  2. Đóng gói file cài đặt:
     - File cài đặt trực tiếp APK: **`flutter build apk --release`** (`build/app/outputs/flutter-apk/app-release.apk`).
     - File đưa lên Google Play (**Google Play bắt buộc định dạng `.aab`**): **`flutter build appbundle --release`** (`build/app/outputs/bundle/release/app-release.aab`).
  3. **Bảo mật khi phát hành**: Tạo keystore, cấu hình qua `android/key.properties` và **bảo vệ an toàn khoá ký ứng dụng** (**Secure signing keys** — không commit keystore/key.properties lên Git công khai).
- **Tại sao phần phát hành (Deployment — Ch.14) được xếp là mở rộng (Optional / Plus)?** Vì sinh viên vẫn có thể chạy và kiểm thử trọn vẹn ứng dụng mà không bắt buộc phải đưa lên chợ ứng dụng (**Apps can be tested without publishing**).
