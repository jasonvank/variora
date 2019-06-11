/* eslint-disable comma-dangle */
import '../../css/test_index.css'
import 'regenerator-runtime/runtime'

import { Avatar, Col, Icon, Input, Layout, Dropdown, Menu, Row } from 'antd'
import { FormattedMessage, IntlProvider, addLocaleData, injectIntl } from 'react-intl'
import { getCookie, getValFromUrlParam, groupAvatarColors } from 'util.js'
import React from 'react'

import { GroupSelectionButton } from '../group_selection_button.jsx'
import { InvitationsToggleButton } from '../invitations_toggle_button.jsx'
import { NotificationsAlertButton } from '../notifications_alert_button.jsx'

const { Header } = Layout
const Search = Input.Search

class GlobalSider extends React.Component{
  constructor(props){
    super(props)
    this.state ={
    
    }
  }
  
  render() {
    return("
    ")
  }
}

export {GlobalSider}
