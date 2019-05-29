const initialStore = {
  locale: navigator.language.split(/[-_]/)[0] || 'en',
  mostViewsDocuments: undefined,
  mostStarsDocuments: undefined,
  mostAnnotationsDocuments: undefined,
  createdReadlists: [],
  collectedReadlists: [],
  user: {
    nickname: '',
    email_address: '',
    is_authenticated: false,
    portrait_url: '/media/portrait/default_portrait.png',
  },
}

export { initialStore }
