import React from "react";
import * as MdIcons from "react-icons/md";

export const IconData = [
    {
        title: "Placements",
        path: "/placements",
        icon: <MdIcons.MdOutlineSchool />,
        cName: "nav-text"
    },

    {
        title: "HQ",
        path: "/hq",
        icon: <MdIcons.MdOutlineHouse />,
        cName: "nav-text"
    },

    {
        title: "LogOut",
        path: "/logout",
        icon: <MdIcons.MdOutlineLogin />,
        cName: "nav-text"
    },


    {
        name: "edit",
        icon: <MdIcons.MdEdit />
    },

    {
        name: "delete",
        icon: <MdIcons.MdDelete />
    },

    {
        name: "save",
        icon: <MdIcons.MdSave />
    },

    {
        name: "add",
        icon: <MdIcons.MdNoteAdd />
    },

    {
        name: "close",
        icon: <MdIcons.MdClose />
    }
];
