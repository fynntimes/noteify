import React, { useState } from 'react';
import './Home.css';
import moment from 'moment';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import { makeStyles, withStyles } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import { EditorState, convertToRaw, convertFromRaw } from 'draft-js';
import DialogTitle from '@material-ui/core/DialogTitle';
import Draggable from 'react-draggable';
import { Editor } from 'react-draft-wysiwyg';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import { omit } from 'lodash';

function PaperComponent(props) {
    return (
        <Draggable handle="#draggable-dialog-title" cancel={'[class*="MuiDialogContent-root"]'}>
            <Paper {...props} />
        </Draggable>
    );
}

const StyledDialog = withStyles({ root: { pointerEvents: "none", }, paper: { pointerEvents: "auto" } })(props => <Dialog hideBackdrop {...props} />);

function DraggableDialog(props) {
    const { file, open, focused, onClose, onFocus } = props;

    const handleClose = () => onClose(file);

    const handleFocus = () => { if (focused) onFocus(file.name) };

    console.log(file.data);
    const [editorContent, setEditorContent] = useState(file.data ? EditorState.createWithContent(convertFromRaw(file.data)) : EditorState.createEmpty());

    const handleChange = (content) => {
        file.data = convertToRaw(content.getCurrentContent());
        return setEditorContent(content);
    }

    return (
        <StyledDialog
            open={open}
            onClick={handleFocus}
            onClose={handleClose}
            PaperComponent={PaperComponent}
            aria-labelledby="draggable-dialog-title"
        >
            <DialogTitle style={{ cursor: 'move' }} id="draggable-dialog-title">
                {file.name}
            </DialogTitle>
            <DialogContent>
                <Editor
                    editorState={editorContent}
                    wrapperClassName="demo-wrapper"
                    editorClassName="demo-editor"
                    onEditorStateChange={handleChange}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose} color="primary">
                    Done
                </Button>
            </DialogActions>
        </StyledDialog>
    );
}


const useStyles = makeStyles((theme) => ({
    table: {
        minWidth: 650,
    },
}));

export default function Home() {

    const [files, setFiles] = useState([
        {
            "name": "Test File 1",
            "dateModified": moment().toLocaleString()
        },
        {
            "name": "Test File 2",
            "dateModified": moment().subtract(1, "day").toLocaleString()
        }
    ]);
    const [editingComponents, setEditingComponents] = useState({});

    function handleClick(row) {
        return () => setEditingComponents(Object.assign({}, editingComponents, {
            [row.name]: <DraggableDialog key={'editing' + row.name} file={row} open={true} focused={true} onFocus={handleFocus} onClose={handleClose}></DraggableDialog>,
        }));
    }

    const handleClose = (file) => {
        files[files.findIndex(f => f.name === file.name)] = file;
        setFiles(files);
        setEditingComponents(omit(editingComponents, file.name));
    }

    const handleFocus = (fileName) => console.log("Sorry, " + fileName + "... but that's not implemented yet :(");

    const classes = useStyles();

    return (
        <div>
            <TableContainer component={Paper}>
                <Table className={classes.table} aria-label="simple table">
                    <TableHead>
                        <TableRow>
                            <TableCell>File name</TableCell>
                            <TableCell align="right">Date modified</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {files.map((row) => (
                            <TableRow key={row.name} name={row.name} onDoubleClick={handleClick(row)}>
                                <TableCell component="th" scope="row">
                                    {row.name}
                                </TableCell>
                                <TableCell align="right">{row.dateModified}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
            {Object.values(editingComponents)}
        </div>
    );
}
