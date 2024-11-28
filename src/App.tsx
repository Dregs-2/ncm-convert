import {useState} from "react";
import {invoke} from "@tauri-apps/api/core";
import "./App.css";
import Box from '@mui/joy/Box';
import {Button, ButtonGroup, IconButton, List, ListItem, ListItemButton} from "@mui/joy";
import {Delete} from "@mui/icons-material";
import { open } from '@tauri-apps/plugin-dialog';

interface FileItem {
    path: string;
    handled: boolean;
}
function App() {
    const [list, setList] = useState<FileItem[]>([]);
    const [target, setTarget] = useState("");

    async function convert(input: string, output: string) {
        // Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
        if (await invoke<boolean>("convert", {input, output})) {
            let newList = list.map((item) => {
                console.log(item, input);
                return {path: item.path, handled: item.path === input}
            })
            setList(newList);
        }
    }

    async function convertList() {
        if (target === "") {
            return;
        }
        for (let item of list) {
            await convert(item.path, target)
        }
    }


    function getList() {
        return list.filter((item) => !item.handled)
    }

    function deleteItem(path: string) {
        setList(getList().filter((item) => item.path !== path))
    }

    function addItem(path: string) {
        setList(getList().filter((item) => item.path !== path).filter((item) => !item.handled).concat([{
            path: path,
            handled: false
        }]))
    }

    async function selectItem() {
        const paths = await open({
            filters: [{name : "ncm", extensions: ["ncm", "NCM"]}],
            multiple: true,
            directory: false,
        });
        console.log(paths);
        if (!paths) {
            return;
        }
        for (let path of paths) {
            addItem(path);
        }
    }

    async function selectTarget() {
        const path = await open({
            multiple: false,
            directory: true,
        });
        console.log(path)

        if (path) {
            setTarget(path)
        }
    }

    return (
        <Box  component="section" sx={{p: 2, border: '1px dashed grey', alignItems: 'center'}}>

            <ButtonGroup>
                <Button variant="solid" onClick={() => selectItem()}>select NCM</Button>
                <Button variant="solid" onClick={() => selectTarget()}>select target</Button>
                <Button variant="solid" onClick={() => convertList()}>convert</Button>
            </ButtonGroup>
            <List>
                {list.map((item) =>

                    <ListItem  endAction={
                        <IconButton aria-label="Delete" size="sm" color="danger" onClick={() => deleteItem(item.path)}>
                            <Delete/>
                        </IconButton>} >
                        <ListItemButton selected={item.handled}>{item.path}</ListItemButton>
                    </ListItem>
                        )
                }
            </List>

        </Box>


    );
}

export default App;
