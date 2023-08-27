# Privacy Policy

## Website Access

### Utaku Media Downloader (hereinafter referred to as UTAKU) can access the following:

#### Full website access, content script, and stylesheet injection

UTAKU inserts content scripts and stylesheets when accessing websites. When UTAKU's popup is active, it checks the headers of the network resources requested by the site. Code inserted through scripts is required to obtain image information from the resources requested by the site.

#### Tab and Active Tab Permissions

UTAKU checks the currently active tab to prevent duplicate execution of popup windows. In addition, tab permissions are needed for managing resources on a per-tab basis.

#### Chrome Storage Sync Permissions

UTAKU requires Chrome Storage Sync permissions to save user settings. Only the settings configured by the user in UTAKU are stored; no other data is saved.

#### Download Management Permissions

UTAKU requires download management permissions to set the download location. When a download is initiated with the popup active, it occurs at the location set by the user. This applies only to downloads conducted through UTAKU and does not affect other downloads.

**Note: This application does not collect any data.**

## Permissions

Here are the permissions UTAKU requires and their explanations:

- `"tabs"` and `"activeTab"`

  - **Purpose**: To check the currently active tab and manage resources per tab.
  - **Usage**: UTAKU identifies the active tab to avoid duplicate popups and to manage resources for each tab.

- `"unlimitedStorage"`

  - **Purpose**: To save user settings without storage limits.
  - **Usage**: UTAKU stores user settings and configurations.

- `"scripting"`

  - **Purpose**: To insert content scripts into web pages.
  - **Usage**: UTAKU uses this permission to inject content scripts for collecting resource metadata from websites.

- `"storage"`

  - **Purpose**: For Chrome Storage Sync.
  - **Usage**: UTAKU stores user settings using Chrome Storage Sync for better user experience across different devices.

- `"downloads"`

  - **Purpose**: To manage download settings and locations.
  - **Usage**: UTAKU uses this permission to control where the downloaded media will be saved based on user settings.

- `"webRequest"`

  - **Purpose**: To monitor and manipulate web requests.
  - **Usage**: UTAKU checks the headers of the network resources requested by the website for further operations like media downloading.

- `"<all_urls>"`
  - **Purpose**: To allow content scripts, stylesheets, and webRequest operations on all websites.
  - **Usage**: UTAKU needs access to all URLs for its content scripts, stylesheets, and webRequest functionalities to work properly.

**Note: UTAKU does not collect any personal or sensitive data.**

---

## 사이트 접근 권한

### Utaku Media Downloader (이하 UTAKU)는 다음을 액세스 할 수 있습니다:

#### 모든 사이트에 대한 접근 권한 및 컨텐츠 스크립트, 스타일시트 삽입

UTAKU는 웹사이트를 접근할 때 컨텐츠 스크립트 및 스타일시트를 삽입합니다. 그리고 UTAKU의 팝업이 활성화 되어있을 때, 사이트가 요청한 네트워크 리소스의 헤더를 확인합니다. 사이트로부터 요청된 리소스의 이미지 정보를 얻기 위해, 스크립트로 삽입된 코드가 필요합니다.

#### 탭 및 활성화 탭 접근 권한

UTAKU는 현재 활성화된 탭을 확인하여, 팝업창의 중복 실행을 방지하고자 합니다. 또한, 탭별로 리소스를 관리하기 위해, 탭 접근 권한이 필요합니다.

#### Chrome Storage Sync 접근 권한

UTAKU는 사용자의 설정값을 저장하기 위해, Chrome Storage Sync 권한이 필요합니다. 사용자가 설정한 UTAKU의 설정만 저장하며, 다른 데이터는 저장하지 않습니다.

#### 다운로드 관리 권한

UTAKU는 다운로드 위치를 설정하기 위해, 다운로드 관리 권한이 필요합니다. 팝업창이 활성화된 상태에서, 다운로드를 진행했을 때, 사용자가 설정한 위치에 다운로드를 진행합니다. 이는 UTAKU에서 다운로드 할 때에만 적용되며, 다른 다운로드에는 영향을 주지 않습니다.

**주의: 이 프로그램은 어떤 데이터도 수집하지 않습니다.**

## 권한

UTAKU가 요구하는 권한과 그 설명은 다음과 같습니다:

- `"tabs"`와 `"activeTab"`

  - **목적**: 현재 활성화된 탭을 확인하고 탭별로 리소스를 관리합니다.
  - **사용**: UTAKU는 활성화된 탭을 확인하여 팝업창의 중복 실행을 방지하고, 각 탭별로 리소스를 관리합니다.

- `"unlimitedStorage"`

  - **목적**: 사용자 설정을 저장 제한 없이 저장합니다.
  - **사용**: UTAKU는 사용자의 설정과 구성을 저장합니다.

- `"scripting"`

  - **목적**: 웹 페이지에 콘텐츠 스크립트를 삽입합니다.
  - **사용**: UTAKU는 이 권한을 사용하여 웹사이트에서 리소스 메타데이터를 수집하기 위한 콘텐츠 스크립트를 삽입합니다.

- `"storage"`

  - **목적**: Chrome Storage Sync를 위함입니다.
  - **사용**: UTAKU는 다양한 디바이스에서 더 나은 사용자 경험을 위해 Chrome Storage Sync를 사용하여 사용자 설정을 저장합니다.

- `"downloads"`

  - **목적**: 다운로드 설정과 위치를 관리합니다.
  - **사용**: UTAKU는 사용자의 설정에 기반하여 미디어가 다운로드될 위치를 제어하는데 이 권한을 사용합니다.

- `"webRequest"`

  - **목적**: 웹 요청을 모니터링하고 조작합니다.
  - **사용**: UTAKU는 미디어 다운로드와 같은 추가 작업을 위해 웹사이트가 요청한 네트워크 리소스의 헤더를 확인합니다.

- `"<all_urls>"`
  - **목적**: 모든 웹사이트에 대해 콘텐츠 스크립트, 스타일시트, 그리고 webRequest 작업을 허용합니다.
  - **사용**: UTAKU는 콘텐츠 스크립트, 스타일시트, 그리고 webRequest 기능이 제대로 작동하기 위해 모든 URL에 대한 접근이 필요합니다.

**주의: UTAKU는 어떠한 개인 또는 민감한 데이터도 수집하지 않습니다.**
