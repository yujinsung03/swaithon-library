// Everything the app shows the user, per app language. Korean phrases (examples, labels a Korean
// speaker reads in Listen) stay in Korean in every language.

export const languages = [
  { code: 'en', name: 'English', native: 'English' },
  { code: 'ja', name: 'Japanese', native: '日本語' },
  { code: 'zh', name: 'Chinese', native: '简体中文' },
  { code: 'vi', name: 'Vietnamese', native: 'Tiếng Việt' },
  { code: 'th', name: 'Thai', native: 'ไทย' },
  { code: 'ru', name: 'Russian', native: 'Русский' },
] as const;

export type LanguageCode = (typeof languages)[number]['code'];

export type ErrorKey =
  | 'generic'
  | 'quota'
  | 'busy'
  | 'noSpeech'
  | 'connection'
  | 'micBlocked'
  | 'micNotFound'
  | 'micStartFailed'
  | 'network'
  | 'unsupported'
  | 'copyFailed';

export interface Strings {
  nav: { speak: string; listen: string; learn: string; writing: string; language: string };
  languageDialog: { title: string; description: string; close: string };
  errors: Record<ErrorKey, string>;
  common: { processing: string; fewSeconds: string; go: string };
  speak: {
    brand: string;
    tapToStart: string;
    startAria: string;
    stopAria: string;
    speakButton: string;
    stopButton: string;
    noMic: string;
    typeLabel: string;
    placeholder: string;
    whoIsIt: string;
    friendYounger: string;
    older: string;
    howWell: string;
    stranger: string;
    aLittle: string;
    close: string;
    understandingTitle: string;
    understandingSub: string;
    rewritingTitle: string;
    rewritingSub: string;
  };
  check: {
    brand: string;
    question: string;
    youSaid: string;
    no: string;
    noSub: string;
    yes: string;
    footer: string;
  };
  result: {
    brand: string;
    naturalKorean: string;
    listenButton: string;
    playAria: string;
    whatChanged: string;
    save: string;
    saving: string;
    saved: string;
    saveError: string;
    reply: string;
    replySub: string;
    sayMore: string;
    sayMoreSub: string;
  };
  listen: {
    typeLabel: string;
    isThisWhatTheySaid: string;
    checkFooter: string;
    header: string;
    savedToBook: string;
    whatTheyMean: string;
    breakdown: string;
    askSlower: string;
    backAria: string;
  };
  writing: {
    brand: string;
    intro: string;
    situation: string;
    situations: Record<'professor_email' | 'coworker_message' | 'restaurant_inquiry' | 'decline_reschedule' | 'other', string>;
    to: string;
    toPlaceholder: string;
    whatToSay: string;
    anyLanguage: string;
    submit: string;
    writingTitle: string;
    writingSub: string;
    nextUp: string;
    subject: string;
    message: string;
    copy: string;
    copied: string;
    placeholderHint: string;
    whatItSays: string;
    usefulExpressions: string;
    writeAnother: string;
    editAria: string;
    toRecipient: (recipient: string) => string;
  };
  learn: {
    synced: string;
    deviceOnly: string;
    title: string;
    intro: string;
    all: string;
    speak: string;
    listen: string;
    loading: string;
    emptyTitle: string;
    emptyBody: string;
    noneOfKind: string;
    corrections: (count: number) => string;
    expressions: (count: number) => string;
    youSaid: string;
    memo: string;
    memoPlaceholder: string;
    delete: string;
    deleteConfirm: string;
    cancel: string;
    saveMemo: string;
    saving: string;
    searchPlaceholder: string;
    clearSearch: string;
    alsoMatching: string;
    noResults: string;
    important: string;
    star: string;
    unstar: string;
  };
}

const en: Strings = {
  nav: { speak: 'SPEAK', listen: 'LISTEN', learn: 'LEARN', writing: 'WRITE', language: 'LANGUAGE' },
  languageDialog: {
    title: 'App language',
    description: 'Menus and explanations will be shown in this language. Korean stays Korean.',
    close: 'Close',
  },
  errors: {
    generic: 'Something went wrong. Please try again.',
    quota: 'The AI is used up for now. Try again later.',
    busy: 'The AI is busy right now. Try again in a moment.',
    noSpeech: 'I didn’t hear anything. Tap the mic and speak again.',
    connection: 'Could not reach the server. Check your internet connection and try again.',
    micBlocked: 'Microphone access is blocked. Allow the microphone in your browser’s address bar, then try again.',
    micNotFound: 'No microphone was found. Check that one is connected.',
    micStartFailed: 'Could not start the microphone. Try again.',
    network: 'Speech recognition needs an internet connection.',
    unsupported: 'This browser can’t use the microphone. You can still type.',
    copyFailed: 'Could not copy. Select the text and copy it manually.',
  },
  common: { processing: 'Processing', fewSeconds: 'This usually takes a few seconds', go: 'Go' },
  speak: {
    brand: 'Voice Assistant',
    tapToStart: 'Tap microphone to start speaking',
    startAria: 'Start speaking',
    stopAria: 'Stop and send',
    speakButton: 'SPEAK',
    stopButton: 'STOP',
    noMic: 'This browser can’t use the microphone. You can still type below.',
    typeLabel: 'Or type what you want to say',
    placeholder: 'e.g. 나는 먹고 싶어 pizza',
    whoIsIt: 'Who is it?',
    friendYounger: 'Friend / Younger',
    older: 'Older',
    howWell: 'How well do you know each other?',
    stranger: 'Stranger',
    aLittle: 'A little',
    close: 'Close',
    understandingTitle: 'Understanding you...',
    understandingSub: 'Figuring out what you want to say',
    rewritingTitle: 'Finding natural Korean...',
    rewritingSub: 'Matching the tone to who you are talking to',
  },
  check: {
    brand: 'Check your meaning',
    question: 'Is this what you’re trying to say?',
    youSaid: 'You said',
    no: 'NO',
    noSub: 'Edit or say again',
    yes: 'YES',
    footer: 'Confirm to get natural Korean',
  },
  result: {
    brand: 'Say it like this',
    naturalKorean: 'Natural Korean for you',
    listenButton: '🔊 Listen',
    playAria: 'Play pronunciation',
    whatChanged: 'What changed & why',
    save: '◆ Save to Feedback Book',
    saving: 'Saving...',
    saved: '✓ Saved to Feedback Book',
    saveError: '⚠ Could not save. Tap to retry',
    reply: 'Reply',
    replySub: 'Listen to their answer',
    sayMore: 'Say more',
    sayMoreSub: 'Speak again',
  },
  listen: {
    typeLabel: 'Or type what you heard',
    isThisWhatTheySaid: 'Is this what they said?',
    checkFooter: 'Confirm to see the meaning',
    header: 'LISTENING & CONTEXT',
    savedToBook: 'Saved to Feedback Book',
    whatTheyMean: 'WHAT THEY MEAN',
    breakdown: 'CULTURAL & WORD BREAKDOWN',
    askSlower: 'Ask them to speak slower',
    backAria: 'Listen again',
  },
  writing: {
    brand: 'WRITE',
    intro: 'Tell me what you want to say. I’ll write it the way a Korean would.',
    situation: 'Situation',
    situations: {
      professor_email: 'Email to professor',
      coworker_message: 'Message to coworker',
      restaurant_inquiry: 'Ask a restaurant',
      decline_reschedule: 'Decline or reschedule',
      other: 'Something else',
    },
    to: 'To',
    toPlaceholder: 'e.g. 교수님, 팀장님, 집주인',
    whatToSay: 'What do you want to say?',
    anyLanguage: 'Any language is OK.',
    submit: 'Write it in Korean',
    writingTitle: 'Writing your message...',
    writingSub: 'Following Korean conventions for this situation',
    nextUp: 'Translation and expression notes come next.',
    subject: 'Subject',
    message: 'Message',
    copy: 'Copy',
    copied: '✓ Copied',
    placeholderHint: 'Replace the parts in [brackets] with your own details before sending.',
    whatItSays: 'What it says',
    usefulExpressions: 'Useful expressions',
    writeAnother: '✎ Write another message',
    editAria: 'Edit request',
    toRecipient: (recipient) => `to ${recipient}`,
  },
  learn: {
    synced: '☁ Synced',
    deviceOnly: '● This device only',
    title: 'Feedback Book',
    intro: 'Sentences and expressions you saved from Speak and Listen.',
    all: 'All',
    speak: 'Speak',
    listen: 'Listen',
    loading: 'Loading your Feedback Book...',
    emptyTitle: 'Nothing saved yet',
    emptyBody: 'Save a correction in Speak, or explain a sentence in Listen, to start your Feedback Book.',
    noneOfKind: 'No entries here yet.',
    corrections: (n) => `${n} correction${n === 1 ? '' : 's'}`,
    expressions: (n) => `${n} expression${n === 1 ? '' : 's'}`,
    youSaid: 'You said',
    memo: 'My memo',
    memoPlaceholder: 'Add a note to remember this...',
    delete: 'Delete',
    deleteConfirm: 'Delete this entry?',
    cancel: 'Cancel',
    saveMemo: 'Save memo',
    saving: 'Saving...',
    searchPlaceholder: 'Search in any language',
    clearSearch: 'Clear search',
    alsoMatching: 'Also searching:',
    noResults: 'No entries match your search.',
    important: 'Important',
    star: 'Mark as important',
    unstar: 'Remove from important',
  },
};

const ja: Strings = {
  nav: { speak: '話す', listen: '聞く', learn: '学ぶ', writing: '書く', language: '言語' },
  languageDialog: {
    title: 'アプリの言語',
    description: 'メニューと説明がこの言語で表示されます。韓国語の部分はそのままです。',
    close: '閉じる',
  },
  errors: {
    generic: 'エラーが発生しました。もう一度お試しください。',
    quota: '現在AIの利用上限に達しています。しばらくしてからお試しください。',
    busy: 'AIが混み合っています。少し待ってからお試しください。',
    noSpeech: '何も聞こえませんでした。マイクを押してもう一度話してください。',
    connection: 'サーバーに接続できません。インターネット接続を確認してください。',
    micBlocked: 'マイクがブロックされています。アドレスバーでマイクを許可してから、もう一度お試しください。',
    micNotFound: 'マイクが見つかりません。接続を確認してください。',
    micStartFailed: 'マイクを起動できませんでした。もう一度お試しください。',
    network: '音声認識にはインターネット接続が必要です。',
    unsupported: 'このブラウザではマイクを使えません。文字で入力できます。',
    copyFailed: 'コピーできませんでした。テキストを選択して手動でコピーしてください。',
  },
  common: { processing: '処理中', fewSeconds: '通常は数秒で終わります', go: '送信' },
  speak: {
    brand: '音声アシスタント',
    tapToStart: 'マイクを押して話してください',
    startAria: '話し始める',
    stopAria: '止めて送信',
    speakButton: '話す',
    stopButton: '停止',
    noMic: 'このブラウザではマイクを使えません。下に入力できます。',
    typeLabel: 'または言いたいことを入力',
    placeholder: '例: 나는 ラーメン 먹고 싶어',
    whoIsIt: '相手は誰ですか？',
    friendYounger: '友達・年下',
    older: '年上',
    howWell: 'どのくらい親しいですか？',
    stranger: '初対面',
    aLittle: '少し',
    close: '親しい',
    understandingTitle: '内容を理解しています...',
    understandingSub: '言いたいことを確認しています',
    rewritingTitle: '自然な韓国語を探しています...',
    rewritingSub: '相手に合った話し方にしています',
  },
  check: {
    brand: '意味の確認',
    question: '言いたいのはこれですか？',
    youSaid: 'あなたの発言',
    no: 'いいえ',
    noSub: '修正・言い直す',
    yes: 'はい',
    footer: '確認すると自然な韓国語が表示されます',
  },
  result: {
    brand: 'こう言いましょう',
    naturalKorean: 'あなたにぴったりの自然な韓国語',
    listenButton: '🔊 聞く',
    playAria: '発音を再生',
    whatChanged: '変わったところと理由',
    save: '◆ フィードバック帳に保存',
    saving: '保存中...',
    saved: '✓ フィードバック帳に保存しました',
    saveError: '⚠ 保存できませんでした。タップして再試行',
    reply: '返事を聞く',
    replySub: '相手の答えを聞く',
    sayMore: 'もっと話す',
    sayMoreSub: 'もう一度話す',
  },
  listen: {
    typeLabel: 'または聞いた言葉を入力',
    isThisWhatTheySaid: '相手はこう言いましたか？',
    checkFooter: '確認すると意味が表示されます',
    header: '聞き取りと文脈',
    savedToBook: 'フィードバック帳に保存済み',
    whatTheyMean: '相手が言いたいこと',
    breakdown: '文化と言葉の解説',
    askSlower: 'ゆっくり話してもらう',
    backAria: 'もう一度聞く',
  },
  writing: {
    brand: '書く',
    intro: '伝えたいことを教えてください。韓国人らしい文章にします。',
    situation: '状況',
    situations: {
      professor_email: '教授へのメール',
      coworker_message: '同僚へのメッセージ',
      restaurant_inquiry: 'お店への問い合わせ',
      decline_reschedule: '断る・日程変更',
      other: 'その他',
    },
    to: '宛先',
    toPlaceholder: '例: 교수님, 팀장님, 집주인',
    whatToSay: '何を伝えたいですか？',
    anyLanguage: 'どの言語でも大丈夫です。',
    submit: '韓国語で書く',
    writingTitle: 'メッセージを作成中...',
    writingSub: 'この状況の韓国の書き方に合わせています',
    nextUp: '翻訳と表現の説明がこのあと表示されます。',
    subject: '件名',
    message: 'メッセージ',
    copy: 'コピー',
    copied: '✓ コピーしました',
    placeholderHint: '[ ] の部分を自分の情報に書き換えてから送ってください。',
    whatItSays: '意味',
    usefulExpressions: '役立つ表現',
    writeAnother: '✎ 別のメッセージを書く',
    editAria: '内容を修正',
    toRecipient: (recipient) => `宛先: ${recipient}`,
  },
  learn: {
    synced: '☁ 同期済み',
    deviceOnly: '● この端末のみ',
    title: 'フィードバック帳',
    intro: '「話す」と「聞く」で保存した文と表現です。',
    all: 'すべて',
    speak: '話す',
    listen: '聞く',
    loading: 'フィードバック帳を読み込み中...',
    emptyTitle: 'まだ何も保存されていません',
    emptyBody: '「話す」で添削を保存するか、「聞く」で文の説明を見ると、ここに追加されます。',
    noneOfKind: 'まだ記録がありません。',
    corrections: (n) => `添削 ${n}件`,
    expressions: (n) => `表現 ${n}件`,
    youSaid: 'あなたの発言',
    memo: 'メモ',
    memoPlaceholder: '覚えておきたいことをメモ...',
    delete: '削除',
    deleteConfirm: 'この記録を削除しますか？',
    cancel: 'キャンセル',
    saveMemo: 'メモを保存',
    saving: '保存中...',
    searchPlaceholder: 'どの言語でも検索できます',
    clearSearch: '検索をクリア',
    alsoMatching: '同じ意味でも検索中:',
    noResults: '検索に合う記録がありません。',
    important: '重要',
    star: '重要にする',
    unstar: '重要を外す',
  },
};

const zh: Strings = {
  nav: { speak: '说', listen: '听', learn: '学', writing: '写', language: '语言' },
  languageDialog: {
    title: '应用语言',
    description: '菜单和说明将以此语言显示。韩语部分保持不变。',
    close: '关闭',
  },
  errors: {
    generic: '出了点问题，请重试。',
    quota: 'AI 暂时达到使用上限，请稍后再试。',
    busy: 'AI 现在很忙，请稍后再试。',
    noSpeech: '没有听到声音。请点击麦克风再说一次。',
    connection: '无法连接服务器。请检查网络后重试。',
    micBlocked: '麦克风被阻止了。请在浏览器地址栏允许麦克风后重试。',
    micNotFound: '找不到麦克风。请检查是否已连接。',
    micStartFailed: '无法启动麦克风，请重试。',
    network: '语音识别需要网络连接。',
    unsupported: '此浏览器无法使用麦克风，可以直接输入文字。',
    copyFailed: '无法复制。请选中文字后手动复制。',
  },
  common: { processing: '处理中', fewSeconds: '通常只需几秒钟', go: '发送' },
  speak: {
    brand: '语音助手',
    tapToStart: '点击麦克风开始说话',
    startAria: '开始说话',
    stopAria: '停止并发送',
    speakButton: '说话',
    stopButton: '停止',
    noMic: '此浏览器无法使用麦克风，可以在下面输入。',
    typeLabel: '或者输入你想说的话',
    placeholder: '例: 나는 먹고 싶어 火锅',
    whoIsIt: '对方是谁？',
    friendYounger: '朋友 / 晚辈',
    older: '长辈',
    howWell: '你们有多熟？',
    stranger: '初次见面',
    aLittle: '有点熟',
    close: '很熟',
    understandingTitle: '正在理解你的意思...',
    understandingSub: '正在确认你想说什么',
    rewritingTitle: '正在寻找自然的韩语...',
    rewritingSub: '正在根据对方调整语气',
  },
  check: {
    brand: '确认意思',
    question: '你想说的是这个吗？',
    youSaid: '你说的',
    no: '不是',
    noSub: '修改或重说',
    yes: '是',
    footer: '确认后显示自然的韩语',
  },
  result: {
    brand: '这样说吧',
    naturalKorean: '适合你的自然韩语',
    listenButton: '🔊 听发音',
    playAria: '播放发音',
    whatChanged: '修改内容和原因',
    save: '◆ 保存到反馈本',
    saving: '保存中...',
    saved: '✓ 已保存到反馈本',
    saveError: '⚠ 保存失败，点击重试',
    reply: '听回答',
    replySub: '听对方的回答',
    sayMore: '继续说',
    sayMoreSub: '再说一次',
  },
  listen: {
    typeLabel: '或者输入你听到的话',
    isThisWhatTheySaid: '对方是这么说的吗？',
    checkFooter: '确认后显示意思',
    header: '听力与语境',
    savedToBook: '已保存到反馈本',
    whatTheyMean: '对方的意思',
    breakdown: '文化与词语解析',
    askSlower: '请对方说慢一点',
    backAria: '再听一次',
  },
  writing: {
    brand: '写',
    intro: '告诉我你想说什么，我会用韩国人的方式写出来。',
    situation: '情境',
    situations: {
      professor_email: '给教授的邮件',
      coworker_message: '给同事的消息',
      restaurant_inquiry: '询问餐厅',
      decline_reschedule: '拒绝或改期',
      other: '其他',
    },
    to: '收件人',
    toPlaceholder: '例: 교수님, 팀장님, 집주인',
    whatToSay: '你想说什么？',
    anyLanguage: '任何语言都可以。',
    submit: '用韩语写',
    writingTitle: '正在写消息...',
    writingSub: '正在按照这种情境的韩国写法来写',
    nextUp: '翻译和表达说明马上就来。',
    subject: '主题',
    message: '消息',
    copy: '复制',
    copied: '✓ 已复制',
    placeholderHint: '发送前请把 [ ] 里的内容换成你自己的信息。',
    whatItSays: '意思',
    usefulExpressions: '实用表达',
    writeAnother: '✎ 再写一条消息',
    editAria: '修改内容',
    toRecipient: (recipient) => `收件人: ${recipient}`,
  },
  learn: {
    synced: '☁ 已同步',
    deviceOnly: '● 仅此设备',
    title: '反馈本',
    intro: '你在“说”和“听”中保存的句子和表达。',
    all: '全部',
    speak: '说',
    listen: '听',
    loading: '正在加载反馈本...',
    emptyTitle: '还没有保存任何内容',
    emptyBody: '在“说”中保存修改，或在“听”中查看句子解析，就会出现在这里。',
    noneOfKind: '这里还没有记录。',
    corrections: (n) => `${n} 处修改`,
    expressions: (n) => `${n} 个表达`,
    youSaid: '你说的',
    memo: '我的备注',
    memoPlaceholder: '记下想记住的内容...',
    delete: '删除',
    deleteConfirm: '要删除这条记录吗？',
    cancel: '取消',
    saveMemo: '保存备注',
    saving: '保存中...',
    searchPlaceholder: '可用任何语言搜索',
    clearSearch: '清除搜索',
    alsoMatching: '同时搜索:',
    noResults: '没有符合搜索的记录。',
    important: '重要',
    star: '标为重要',
    unstar: '取消重要',
  },
};

const vi: Strings = {
  nav: { speak: 'NÓI', listen: 'NGHE', learn: 'HỌC', writing: 'VIẾT', language: 'NGÔN NGỮ' },
  languageDialog: {
    title: 'Ngôn ngữ ứng dụng',
    description: 'Menu và phần giải thích sẽ hiển thị bằng ngôn ngữ này. Tiếng Hàn vẫn giữ nguyên.',
    close: 'Đóng',
  },
  errors: {
    generic: 'Đã xảy ra lỗi. Vui lòng thử lại.',
    quota: 'AI tạm thời đã hết lượt dùng. Vui lòng thử lại sau.',
    busy: 'AI đang bận. Vui lòng thử lại sau giây lát.',
    noSpeech: 'Không nghe thấy gì. Hãy nhấn micro và nói lại.',
    connection: 'Không kết nối được máy chủ. Hãy kiểm tra Internet và thử lại.',
    micBlocked: 'Micro đang bị chặn. Hãy cho phép micro trên thanh địa chỉ của trình duyệt rồi thử lại.',
    micNotFound: 'Không tìm thấy micro. Hãy kiểm tra kết nối.',
    micStartFailed: 'Không bật được micro. Vui lòng thử lại.',
    network: 'Nhận dạng giọng nói cần kết nối Internet.',
    unsupported: 'Trình duyệt này không dùng được micro. Bạn vẫn có thể gõ chữ.',
    copyFailed: 'Không sao chép được. Hãy chọn văn bản và sao chép thủ công.',
  },
  common: { processing: 'Đang xử lý', fewSeconds: 'Thường chỉ mất vài giây', go: 'Gửi' },
  speak: {
    brand: 'Trợ lý giọng nói',
    tapToStart: 'Nhấn micro để bắt đầu nói',
    startAria: 'Bắt đầu nói',
    stopAria: 'Dừng và gửi',
    speakButton: 'NÓI',
    stopButton: 'DỪNG',
    noMic: 'Trình duyệt này không dùng được micro. Bạn có thể gõ bên dưới.',
    typeLabel: 'Hoặc gõ điều bạn muốn nói',
    placeholder: 'VD: 나는 먹고 싶어 phở',
    whoIsIt: 'Người đó là ai?',
    friendYounger: 'Bạn bè / Nhỏ tuổi hơn',
    older: 'Lớn tuổi hơn',
    howWell: 'Hai người thân đến mức nào?',
    stranger: 'Mới gặp',
    aLittle: 'Hơi quen',
    close: 'Thân',
    understandingTitle: 'Đang hiểu ý bạn...',
    understandingSub: 'Đang xác định điều bạn muốn nói',
    rewritingTitle: 'Đang tìm câu tiếng Hàn tự nhiên...',
    rewritingSub: 'Đang chỉnh giọng điệu cho phù hợp với người nghe',
  },
  check: {
    brand: 'Kiểm tra ý nghĩa',
    question: 'Đây có phải điều bạn muốn nói?',
    youSaid: 'Bạn đã nói',
    no: 'KHÔNG',
    noSub: 'Sửa hoặc nói lại',
    yes: 'ĐÚNG',
    footer: 'Xác nhận để xem câu tiếng Hàn tự nhiên',
  },
  result: {
    brand: 'Hãy nói thế này',
    naturalKorean: 'Câu tiếng Hàn tự nhiên cho bạn',
    listenButton: '🔊 Nghe',
    playAria: 'Phát âm',
    whatChanged: 'Thay đổi gì & vì sao',
    save: '◆ Lưu vào Sổ phản hồi',
    saving: 'Đang lưu...',
    saved: '✓ Đã lưu vào Sổ phản hồi',
    saveError: '⚠ Không lưu được. Nhấn để thử lại',
    reply: 'Nghe trả lời',
    replySub: 'Nghe câu trả lời của họ',
    sayMore: 'Nói tiếp',
    sayMoreSub: 'Nói lại',
  },
  listen: {
    typeLabel: 'Hoặc gõ điều bạn nghe được',
    isThisWhatTheySaid: 'Họ đã nói thế này phải không?',
    checkFooter: 'Xác nhận để xem ý nghĩa',
    header: 'NGHE & NGỮ CẢNH',
    savedToBook: 'Đã lưu vào Sổ phản hồi',
    whatTheyMean: 'Ý CỦA HỌ',
    breakdown: 'GIẢI THÍCH VĂN HÓA & TỪ NGỮ',
    askSlower: 'Nhờ họ nói chậm lại',
    backAria: 'Nghe lại',
  },
  writing: {
    brand: 'VIẾT',
    intro: 'Hãy cho tôi biết bạn muốn nói gì. Tôi sẽ viết như người Hàn.',
    situation: 'Tình huống',
    situations: {
      professor_email: 'Email cho giáo sư',
      coworker_message: 'Tin nhắn cho đồng nghiệp',
      restaurant_inquiry: 'Hỏi nhà hàng',
      decline_reschedule: 'Từ chối hoặc đổi lịch',
      other: 'Khác',
    },
    to: 'Gửi',
    toPlaceholder: 'VD: 교수님, 팀장님, 집주인',
    whatToSay: 'Bạn muốn nói gì?',
    anyLanguage: 'Ngôn ngữ nào cũng được.',
    submit: 'Viết bằng tiếng Hàn',
    writingTitle: 'Đang viết tin nhắn...',
    writingSub: 'Đang theo cách viết của người Hàn cho tình huống này',
    nextUp: 'Bản dịch và giải thích sẽ có ngay sau đây.',
    subject: 'Tiêu đề',
    message: 'Tin nhắn',
    copy: 'Sao chép',
    copied: '✓ Đã sao chép',
    placeholderHint: 'Hãy thay phần trong [ngoặc] bằng thông tin của bạn trước khi gửi.',
    whatItSays: 'Ý nghĩa',
    usefulExpressions: 'Cách diễn đạt hữu ích',
    writeAnother: '✎ Viết tin nhắn khác',
    editAria: 'Sửa yêu cầu',
    toRecipient: (recipient) => `gửi ${recipient}`,
  },
  learn: {
    synced: '☁ Đã đồng bộ',
    deviceOnly: '● Chỉ trên thiết bị này',
    title: 'Sổ phản hồi',
    intro: 'Các câu và cách diễn đạt bạn đã lưu từ Nói và Nghe.',
    all: 'Tất cả',
    speak: 'Nói',
    listen: 'Nghe',
    loading: 'Đang tải Sổ phản hồi...',
    emptyTitle: 'Chưa lưu gì',
    emptyBody: 'Lưu một lần sửa ở phần Nói, hoặc xem giải thích câu ở phần Nghe để bắt đầu.',
    noneOfKind: 'Chưa có mục nào.',
    corrections: (n) => `${n} chỗ sửa`,
    expressions: (n) => `${n} cách diễn đạt`,
    youSaid: 'Bạn đã nói',
    memo: 'Ghi chú',
    memoPlaceholder: 'Thêm ghi chú để ghi nhớ...',
    delete: 'Xóa',
    deleteConfirm: 'Xóa mục này?',
    cancel: 'Hủy',
    saveMemo: 'Lưu ghi chú',
    saving: 'Đang lưu...',
    searchPlaceholder: 'Tìm bằng bất kỳ ngôn ngữ nào',
    clearSearch: 'Xóa tìm kiếm',
    alsoMatching: 'Cũng đang tìm:',
    noResults: 'Không có mục nào khớp.',
    important: 'Quan trọng',
    star: 'Đánh dấu quan trọng',
    unstar: 'Bỏ đánh dấu quan trọng',
  },
};

const th: Strings = {
  nav: { speak: 'พูด', listen: 'ฟัง', learn: 'เรียน', writing: 'เขียน', language: 'ภาษา' },
  languageDialog: {
    title: 'ภาษาของแอป',
    description: 'เมนูและคำอธิบายจะแสดงเป็นภาษานี้ ส่วนภาษาเกาหลียังคงเดิม',
    close: 'ปิด',
  },
  errors: {
    generic: 'เกิดข้อผิดพลาด โปรดลองอีกครั้ง',
    quota: 'ตอนนี้ใช้ AI ครบโควตาแล้ว โปรดลองใหม่ภายหลัง',
    busy: 'ตอนนี้ AI ไม่ว่าง โปรดลองใหม่อีกสักครู่',
    noSpeech: 'ไม่ได้ยินเสียง แตะไมค์แล้วพูดอีกครั้ง',
    connection: 'เชื่อมต่อเซิร์ฟเวอร์ไม่ได้ โปรดตรวจสอบอินเทอร์เน็ตแล้วลองใหม่',
    micBlocked: 'ไมโครโฟนถูกบล็อก โปรดอนุญาตไมโครโฟนที่แถบที่อยู่ของเบราว์เซอร์ แล้วลองใหม่',
    micNotFound: 'ไม่พบไมโครโฟน โปรดตรวจสอบการเชื่อมต่อ',
    micStartFailed: 'เปิดไมโครโฟนไม่ได้ โปรดลองอีกครั้ง',
    network: 'การจดจำเสียงต้องใช้อินเทอร์เน็ต',
    unsupported: 'เบราว์เซอร์นี้ใช้ไมโครโฟนไม่ได้ แต่ยังพิมพ์ได้',
    copyFailed: 'คัดลอกไม่ได้ โปรดเลือกข้อความแล้วคัดลอกเอง',
  },
  common: { processing: 'กำลังประมวลผล', fewSeconds: 'ปกติใช้เวลาไม่กี่วินาที', go: 'ส่ง' },
  speak: {
    brand: 'ผู้ช่วยเสียง',
    tapToStart: 'แตะไมโครโฟนเพื่อเริ่มพูด',
    startAria: 'เริ่มพูด',
    stopAria: 'หยุดและส่ง',
    speakButton: 'พูด',
    stopButton: 'หยุด',
    noMic: 'เบราว์เซอร์นี้ใช้ไมโครโฟนไม่ได้ พิมพ์ด้านล่างได้',
    typeLabel: 'หรือพิมพ์สิ่งที่อยากพูด',
    placeholder: 'เช่น 나는 먹고 싶어 ต้มยำ',
    whoIsIt: 'คุยกับใคร?',
    friendYounger: 'เพื่อน / อายุน้อยกว่า',
    older: 'อายุมากกว่า',
    howWell: 'สนิทกันแค่ไหน?',
    stranger: 'เพิ่งรู้จัก',
    aLittle: 'รู้จักนิดหน่อย',
    close: 'สนิท',
    understandingTitle: 'กำลังทำความเข้าใจ...',
    understandingSub: 'กำลังดูว่าคุณอยากพูดอะไร',
    rewritingTitle: 'กำลังหาภาษาเกาหลีที่เป็นธรรมชาติ...',
    rewritingSub: 'กำลังปรับน้ำเสียงให้เหมาะกับคู่สนทนา',
  },
  check: {
    brand: 'ตรวจสอบความหมาย',
    question: 'นี่คือสิ่งที่คุณอยากพูดใช่ไหม?',
    youSaid: 'คุณพูดว่า',
    no: 'ไม่ใช่',
    noSub: 'แก้ไขหรือพูดใหม่',
    yes: 'ใช่',
    footer: 'ยืนยันเพื่อดูภาษาเกาหลีที่เป็นธรรมชาติ',
  },
  result: {
    brand: 'พูดแบบนี้',
    naturalKorean: 'ภาษาเกาหลีที่เป็นธรรมชาติสำหรับคุณ',
    listenButton: '🔊 ฟัง',
    playAria: 'เล่นเสียงอ่าน',
    whatChanged: 'เปลี่ยนอะไรและทำไม',
    save: '◆ บันทึกลงสมุดฟีดแบ็ก',
    saving: 'กำลังบันทึก...',
    saved: '✓ บันทึกลงสมุดฟีดแบ็กแล้ว',
    saveError: '⚠ บันทึกไม่ได้ แตะเพื่อลองใหม่',
    reply: 'ฟังคำตอบ',
    replySub: 'ฟังคำตอบของอีกฝ่าย',
    sayMore: 'พูดต่อ',
    sayMoreSub: 'พูดอีกครั้ง',
  },
  listen: {
    typeLabel: 'หรือพิมพ์สิ่งที่ได้ยิน',
    isThisWhatTheySaid: 'เขาพูดแบบนี้ใช่ไหม?',
    checkFooter: 'ยืนยันเพื่อดูความหมาย',
    header: 'การฟังและบริบท',
    savedToBook: 'บันทึกลงสมุดฟีดแบ็กแล้ว',
    whatTheyMean: 'สิ่งที่เขาหมายถึง',
    breakdown: 'คำอธิบายวัฒนธรรมและคำศัพท์',
    askSlower: 'ขอให้พูดช้าลง',
    backAria: 'ฟังอีกครั้ง',
  },
  writing: {
    brand: 'เขียน',
    intro: 'บอกสิ่งที่อยากสื่อ แล้วจะเขียนให้เหมือนคนเกาหลีเขียน',
    situation: 'สถานการณ์',
    situations: {
      professor_email: 'อีเมลถึงอาจารย์',
      coworker_message: 'ข้อความถึงเพื่อนร่วมงาน',
      restaurant_inquiry: 'สอบถามร้านอาหาร',
      decline_reschedule: 'ปฏิเสธหรือเลื่อนนัด',
      other: 'อื่น ๆ',
    },
    to: 'ถึง',
    toPlaceholder: 'เช่น 교수님, 팀장님, 집주인',
    whatToSay: 'อยากบอกอะไร?',
    anyLanguage: 'ใช้ภาษาอะไรก็ได้',
    submit: 'เขียนเป็นภาษาเกาหลี',
    writingTitle: 'กำลังเขียนข้อความ...',
    writingSub: 'กำลังเขียนตามธรรมเนียมเกาหลีของสถานการณ์นี้',
    nextUp: 'คำแปลและคำอธิบายสำนวนจะตามมา',
    subject: 'หัวเรื่อง',
    message: 'ข้อความ',
    copy: 'คัดลอก',
    copied: '✓ คัดลอกแล้ว',
    placeholderHint: 'ก่อนส่ง ให้เปลี่ยนส่วนใน [วงเล็บ] เป็นข้อมูลของคุณ',
    whatItSays: 'ความหมาย',
    usefulExpressions: 'สำนวนที่มีประโยชน์',
    writeAnother: '✎ เขียนข้อความใหม่',
    editAria: 'แก้ไขคำขอ',
    toRecipient: (recipient) => `ถึง ${recipient}`,
  },
  learn: {
    synced: '☁ ซิงค์แล้ว',
    deviceOnly: '● เฉพาะอุปกรณ์นี้',
    title: 'สมุดฟีดแบ็ก',
    intro: 'ประโยคและสำนวนที่คุณบันทึกจากพูดและฟัง',
    all: 'ทั้งหมด',
    speak: 'พูด',
    listen: 'ฟัง',
    loading: 'กำลังโหลดสมุดฟีดแบ็ก...',
    emptyTitle: 'ยังไม่มีอะไรบันทึกไว้',
    emptyBody: 'บันทึกการแก้ไขในหน้าพูด หรือดูคำอธิบายประโยคในหน้าฟัง เพื่อเริ่มสมุดของคุณ',
    noneOfKind: 'ยังไม่มีรายการ',
    corrections: (n) => `แก้ไข ${n} จุด`,
    expressions: (n) => `${n} สำนวน`,
    youSaid: 'คุณพูดว่า',
    memo: 'บันทึกของฉัน',
    memoPlaceholder: 'จดไว้เพื่อจำ...',
    delete: 'ลบ',
    deleteConfirm: 'ลบรายการนี้ไหม?',
    cancel: 'ยกเลิก',
    saveMemo: 'บันทึกโน้ต',
    saving: 'กำลังบันทึก...',
    searchPlaceholder: 'ค้นหาได้ทุกภาษา',
    clearSearch: 'ล้างการค้นหา',
    alsoMatching: 'ค้นหาคำเหล่านี้ด้วย:',
    noResults: 'ไม่พบรายการที่ตรงกับการค้นหา',
    important: 'สำคัญ',
    star: 'ทำเครื่องหมายว่าสำคัญ',
    unstar: 'เลิกทำเครื่องหมายสำคัญ',
  },
};

const ru: Strings = {
  nav: { speak: 'ГОВОРИТЬ', listen: 'СЛУШАТЬ', learn: 'УЧИТЬ', writing: 'ПИСАТЬ', language: 'ЯЗЫК' },
  languageDialog: {
    title: 'Язык приложения',
    description: 'Меню и объяснения будут на этом языке. Корейский текст останется корейским.',
    close: 'Закрыть',
  },
  errors: {
    generic: 'Что-то пошло не так. Попробуйте ещё раз.',
    quota: 'Лимит ИИ сейчас исчерпан. Попробуйте позже.',
    busy: 'ИИ сейчас занят. Попробуйте через минуту.',
    noSpeech: 'Ничего не слышно. Нажмите на микрофон и скажите ещё раз.',
    connection: 'Не удалось подключиться к серверу. Проверьте интернет и попробуйте снова.',
    micBlocked: 'Доступ к микрофону заблокирован. Разрешите микрофон в адресной строке браузера и попробуйте снова.',
    micNotFound: 'Микрофон не найден. Проверьте подключение.',
    micStartFailed: 'Не удалось включить микрофон. Попробуйте ещё раз.',
    network: 'Для распознавания речи нужен интернет.',
    unsupported: 'В этом браузере нельзя использовать микрофон. Можно ввести текст.',
    copyFailed: 'Не удалось скопировать. Выделите текст и скопируйте вручную.',
  },
  common: { processing: 'Обработка', fewSeconds: 'Обычно это занимает несколько секунд', go: 'OK' },
  speak: {
    brand: 'Голосовой помощник',
    tapToStart: 'Нажмите на микрофон, чтобы говорить',
    startAria: 'Начать говорить',
    stopAria: 'Остановить и отправить',
    speakButton: 'ГОВОРИТЬ',
    stopButton: 'СТОП',
    noMic: 'В этом браузере нельзя использовать микрофон. Введите текст ниже.',
    typeLabel: 'Или напишите, что хотите сказать',
    placeholder: 'Напр.: 나는 먹고 싶어 борщ',
    whoIsIt: 'Кто собеседник?',
    friendYounger: 'Друг / младше',
    older: 'Старше',
    howWell: 'Насколько вы знакомы?',
    stranger: 'Незнакомы',
    aLittle: 'Немного',
    close: 'Близко',
    understandingTitle: 'Понимаю вас...',
    understandingSub: 'Определяю, что вы хотите сказать',
    rewritingTitle: 'Ищу естественный корейский...',
    rewritingSub: 'Подбираю тон под собеседника',
  },
  check: {
    brand: 'Проверка смысла',
    question: 'Вы это хотите сказать?',
    youSaid: 'Вы сказали',
    no: 'НЕТ',
    noSub: 'Исправить или сказать снова',
    yes: 'ДА',
    footer: 'Подтвердите, чтобы получить естественный корейский',
  },
  result: {
    brand: 'Скажите так',
    naturalKorean: 'Естественный корейский для вас',
    listenButton: '🔊 Слушать',
    playAria: 'Воспроизвести произношение',
    whatChanged: 'Что изменилось и почему',
    save: '◆ Сохранить в тетрадь',
    saving: 'Сохранение...',
    saved: '✓ Сохранено в тетрадь',
    saveError: '⚠ Не удалось сохранить. Нажмите, чтобы повторить',
    reply: 'Ответ',
    replySub: 'Послушать ответ собеседника',
    sayMore: 'Ещё',
    sayMoreSub: 'Сказать снова',
  },
  listen: {
    typeLabel: 'Или напишите, что услышали',
    isThisWhatTheySaid: 'Вам сказали это?',
    checkFooter: 'Подтвердите, чтобы увидеть смысл',
    header: 'СЛУШАНИЕ И КОНТЕКСТ',
    savedToBook: 'Сохранено в тетрадь',
    whatTheyMean: 'ЧТО ЭТО ЗНАЧИТ',
    breakdown: 'КУЛЬТУРА И СЛОВА',
    askSlower: 'Попросить говорить медленнее',
    backAria: 'Послушать снова',
  },
  writing: {
    brand: 'ПИСАТЬ',
    intro: 'Расскажите, что хотите сказать. Я напишу так, как написал бы кореец.',
    situation: 'Ситуация',
    situations: {
      professor_email: 'Письмо профессору',
      coworker_message: 'Сообщение коллеге',
      restaurant_inquiry: 'Вопрос в ресторан',
      decline_reschedule: 'Отказ или перенос',
      other: 'Другое',
    },
    to: 'Кому',
    toPlaceholder: 'Напр.: 교수님, 팀장님, 집주인',
    whatToSay: 'Что вы хотите сказать?',
    anyLanguage: 'Можно на любом языке.',
    submit: 'Написать по-корейски',
    writingTitle: 'Пишу сообщение...',
    writingSub: 'Следую корейским правилам для этой ситуации',
    nextUp: 'Перевод и пояснения появятся следом.',
    subject: 'Тема',
    message: 'Сообщение',
    copy: 'Копировать',
    copied: '✓ Скопировано',
    placeholderHint: 'Перед отправкой замените части в [скобках] своими данными.',
    whatItSays: 'Смысл',
    usefulExpressions: 'Полезные выражения',
    writeAnother: '✎ Написать другое сообщение',
    editAria: 'Изменить запрос',
    toRecipient: (recipient) => `кому: ${recipient}`,
  },
  learn: {
    synced: '☁ Синхронизировано',
    deviceOnly: '● Только на этом устройстве',
    title: 'Тетрадь отзывов',
    intro: 'Фразы и выражения, сохранённые из разделов «Говорить» и «Слушать».',
    all: 'Все',
    speak: 'Говорить',
    listen: 'Слушать',
    loading: 'Загрузка тетради...',
    emptyTitle: 'Пока ничего не сохранено',
    emptyBody: 'Сохраните исправление в «Говорить» или разбор фразы в «Слушать», чтобы начать.',
    noneOfKind: 'Здесь пока нет записей.',
    corrections: (n) => `Исправлений: ${n}`,
    expressions: (n) => `Выражений: ${n}`,
    youSaid: 'Вы сказали',
    memo: 'Моя заметка',
    memoPlaceholder: 'Добавьте заметку, чтобы запомнить...',
    delete: 'Удалить',
    deleteConfirm: 'Удалить эту запись?',
    cancel: 'Отмена',
    saveMemo: 'Сохранить заметку',
    saving: 'Сохранение...',
    searchPlaceholder: 'Поиск на любом языке',
    clearSearch: 'Очистить поиск',
    alsoMatching: 'Также ищем:',
    noResults: 'Ничего не найдено.',
    important: 'Важное',
    star: 'Отметить как важное',
    unstar: 'Убрать из важного',
  },
};

export const strings: Record<LanguageCode, Strings> = { en, ja, zh, vi, th, ru };
