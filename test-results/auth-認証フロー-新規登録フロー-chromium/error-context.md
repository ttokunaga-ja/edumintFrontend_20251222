# Page snapshot

```yaml
- generic [ref=e2]:
  - alert [ref=e3]:
    - img [ref=e5]
    - generic [ref=e7]: Google ログインは現在実装中です
    - button "Close" [ref=e9] [cursor=pointer]:
      - img [ref=e10]
  - main [ref=e13]:
    - generic [ref=e16]:
      - heading "Edumint" [level=5] [ref=e17]
      - paragraph [ref=e18]: 教育支援プラットフォーム
      - generic [ref=e19]:
        - button "ログイン" [ref=e20] [cursor=pointer]
        - button "新規登録" [ref=e21] [cursor=pointer]
      - generic [ref=e22]:
        - button "Google でログイン" [active] [ref=e23] [cursor=pointer]: Google でログイン
        - button "Microsoft でログイン" [ref=e24] [cursor=pointer]: Microsoft でログイン
      - separator [ref=e25]:
        - paragraph [ref=e27]: または
      - generic [ref=e29]:
        - generic [ref=e31]:
          - generic:
            - text: メールアドレス
            - generic: "*"
          - generic [ref=e32]:
            - textbox "メールアドレス" [ref=e33]
            - group:
              - generic: メールアドレス *
        - generic [ref=e34]:
          - generic:
            - text: パスワード
            - generic: "*"
          - generic [ref=e35]:
            - textbox "パスワード" [ref=e36]
            - group:
              - generic: パスワード *
        - button "ログイン" [ref=e37] [cursor=pointer]: ログイン
```