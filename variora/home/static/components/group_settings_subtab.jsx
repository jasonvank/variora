import 'antd/dist/antd.css';
import 'regenerator-runtime/runtime';

import { Avatar, Button, Col, Icon, Input, Layout, Menu, Modal, Row, Popconfirm } from 'antd';
import {
  Link,
  Route,
  BrowserRouter as Router
} from 'react-router-dom'
import { getCookie } from 'util.js'

import React from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios'
import enUS from 'antd/lib/locale-provider/en_US';

const { SubMenu } = Menu;
const { Header, Content, Sider } = Layout;
const MenuItemGroup = Menu.ItemGroup;


class GroupSettingsSubtab extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      'coteriePk': this.props.coteriePk
    }
    this.deleteGroup = () => {
      var data = new FormData()
      data.append('csrfmiddlewaretoken', getCookie('csrftoken'))
      axios.post('/coterie/api/coteries/' + this.state.coteriePk + '/delete', data)
    }
  }

  async componentWillReceiveProps(nextProps) {
    await this.setState({
      coteriePk: nextProps.coteriePk
    })
  }

  render() {
    return (
      <div>
        <Popconfirm 
          title="Are you sure to delete this group? This cannot be undone." 
          onConfirm={() => this.deleteGroup()} 
          okText="Yes" cancelText="No"
        >
          <Button>Delete</Button>
        </Popconfirm>
      </div> 
    )
  }
}

export { GroupSettingsSubtab }










