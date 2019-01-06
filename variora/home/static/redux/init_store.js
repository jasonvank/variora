const initialStore = {
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
