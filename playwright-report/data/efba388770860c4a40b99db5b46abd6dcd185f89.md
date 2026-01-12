# Page snapshot

```yaml
- main [ref=e4]:
  - generic [ref=e7]:
    - heading "Edumint" [level=5] [ref=e8]
    - paragraph [ref=e9]: 教育支援プラットフォーム
    - generic [ref=e10]:
      - button "ログイン" [active] [ref=e11] [cursor=pointer]: ログイン
      - button "新規登録" [ref=e12] [cursor=pointer]
    - generic [ref=e13]:
      - button "Google でログイン" [ref=e14] [cursor=pointer]
      - button "Microsoft でログイン" [ref=e15] [cursor=pointer]
    - separator [ref=e16]:
      - paragraph [ref=e18]: または
    - generic [ref=e20]:
      - generic [ref=e22]:
        - generic [ref=e23]:
          - text: メールアドレス
          - generic [ref=e24]: "*"
        - generic [ref=e25]:
          - textbox "メールアドレス" [ref=e26]: test@example.com
          - group:
            - generic: メールアドレス *
      - generic [ref=e27]:
        - generic [ref=e28]:
          - text: パスワード
          - generic [ref=e29]: "*"
        - generic [ref=e30]:
          - textbox "パスワード" [ref=e31]: password123
          - group:
            - generic: パスワード *
      - button "ログイン" [ref=e32] [cursor=pointer]
```