import 'source-map-support/register';
import * as _ from 'underscore';
import * as ReactDOM from 'react-dom';
import * as React from 'react';
import {getProperty} from './Utils'
import { Button, OverlayTrigger, Overlay, Col, Row,
    Popover, Input, ButtonToolbar, Tooltip } from 'react-bootstrap';

export type EditableFieldPropTypes = {
    initialValue:any,
    saveHandler:Function,
    requireSameTypeOnSave?:boolean
};
export type EditableFieldStateType = {
    value?:any,
    textEnteredSinceFocus?:boolean,
    textEnteredNotSaved?:boolean,
    showUserInputBox?:boolean,
};

export class EditableField extends React.Component<EditableFieldPropTypes, EditableFieldStateType> {
    static displayName = 'EditableField';
    static propTypes = {
        initialValue: React.PropTypes.any.isRequired,
        saveHandler:React.PropTypes.func,
        requireSameTypeOnSave: React.PropTypes.bool,
    }
    refs: {
        [key:string]:any;
        "target": any;
    }

    constructor(props: any) {
        super(props);
        this.state = {
            value: null,
            textEnteredSinceFocus: false,
            textEnteredNotSaved: false,
            showUserInputBox: false,
        };
        switch (typeof this.props.initialValue){
            case 'string':
                this.state = _.extend(this.state, {
                    value: this.props.initialValue,
                });
            default:
                this.state = _.extend(this.state, {
                    value: getProperty('initialValue.toString', this.props) && this.props.initialValue.toString() || '',
                });
        }
    }

    componentDidMount(){}
    submit(event: any) {
        event.preventDefault();
        this.save(event);
    }

    handleChangeToInput = (event:any) => {
        switch (typeof event.target.value) {
            case 'string':
                this.setState({
                    value: event.target.value.trim(),
                    textEnteredSinceFocus:true,
                    textEnteredNotSaved: true,
                });
            default:
                this.setState({
                    value: event.target.value,
                    textEnteredSinceFocus:true,
                    textEnteredNotSaved: true,
                });
        }
    }

    handleInputBlur = (event:React.FocusEvent) => {
        this.setState({
            textEnteredSinceFocus: false,
            showUserInputBox: !this.state.showUserInputBox,
            value: this.state.value.trim && this.state.value.trim() || this.state.value,
        });
    }

    save = (event:React.SyntheticEvent) => {
        this.setState({
            textEnteredNotSaved: false,
        });

        if (!this.props.requireSameTypeOnSave) {
            this.setState({value:this.state.value})
            this.props.saveHandler(this.state.value);
        }
        else if (typeof this.props.initialValue === typeof(this.state.value)){
            this.setState({value:this.state.value})
            this.props.saveHandler(this.state.value);
        }
        else {
            this.setState({value:this.props.initialValue})
        }
    }

    cancel = (event: React.SyntheticEvent) => {
        event.preventDefault();
        event.stopPropagation();
        console.log("The instance cancel method was called");
        console.log('Cancel button called', event);
        this.setState({
            value:this.props.initialValue,
            textEnteredNotSaved: false,
        })
    }

    showUserInputBox = () => {
        console.log("showUserInputBox called");
        this.setState({showUserInputBox:true})
    }

    shouldShowDataChangeWarning = ():boolean=>{
        if (this.state.textEnteredNotSaved && (this.state.value !== this.props.initialValue)){
            return true
        }
        else false
    }

    render() {
        let linkToInputFieldEntry = (
            <div>
                <a style={{borderBottom: "1px dotted #000"}} ref='target'> {this.state.value || '(No data entered yet)'} </a>
                <Overlay
                    placement='bottom'
                    show={this.shouldShowDataChangeWarning()}
                    container={this.refs.target}
                    target={() => ReactDOM.findDOMNode(this.refs.target)}>
                    <Tooltip id={'dataNotSavedWarning'} style={{display:'table'}} className={"small"}>
                        Warning: You did not save or cancel your field update
                    </Tooltip>
                </Overlay>
            </div>
        );

        let textBoxWarning = (
            <div style={{color:'red', marginTop:"-5px"}} className={"small"}>
                Update has not been saved yet
            </div>
        );

        let PopupSaveButtons = (<Popover id="saveCancelButtonPopover">
            <ButtonToolbar className='editable-buttons'>
                <Button
                    bsStyle='primary'
                    className='btn-sm'
                    onClick={this.save}>
                        <i className='glyphicon glyphicon-ok'></i>
                </Button>
                <Button
                    bsStyle='default'
                    className='btn-sm'
                    onClick={this.cancel}>
                        <i className='glyphicon glyphicon-remove'></i>
                </Button>
                </ButtonToolbar>
            </Popover>);

        let userInputTextBox = (
            <Input
                type='text'
                placeholder={'Empty'}
                value={this.state.value}
                className='input-sm'
                onChange={this.handleChangeToInput}
                onBlur={this.handleInputBlur}
            />
        );

        return (
            <div>
                <Row>
                    <Col xs={4}>
                        <OverlayTrigger trigger="focus" placement="right" overlay={PopupSaveButtons}>
                            <div id="test-id" onClick={this.showUserInputBox}>
                                { (() => {
                                    switch(this.state.showUserInputBox){
                                        case false: return linkToInputFieldEntry
                                        case true:  return userInputTextBox
                                    }
                                })()}
                                { (()=>{
                                    switch (this.shouldShowDataChangeWarning() && this.state.showUserInputBox){
                                        case true: return textBoxWarning
                                        default: return null
                                    }
                                })()}
                            </div>
                        </OverlayTrigger>
                    </Col>
                </Row>

            </div>
        );
    }
}
