'use strict';

//-------- namespace --------
// if (typeof sdk.mkm !== 'object') {
//     sdk.mkm = {};
// }
// if (typeof sdk.dkd !== 'object') {
//     sdk.dkd = {};
// }
if (typeof sdk.msg !== 'object') {
    sdk.msg = {};
}
if (typeof sdk.core !== 'object') {
    sdk.core = {};
}
if (typeof sdk.cpu !== 'object') {
    sdk.cpu = {};
}

//-------- requires --------
var Interface      = mk.type.Interface;
var Class          = mk.type.Class;
var Implementation = mk.type.Implementation;
var Converter      = mk.type.Converter;
var Mapper         = mk.type.Mapper;
var IObject        = mk.type.Object;
var BaseObject     = mk.type.BaseObject;
var UTF8                = mk.format.UTF8;
//var JSON              = mk.format.JSON;
var JSONMap             = mk.format.JSONMap;
var TransportableData    = mk.protocol.TransportableData;
var EncryptKey           = mk.protocol.EncryptKey;
var VerifyKey            = mk.protocol.VerifyKey;
var SymmetricKey         = mk.protocol.SymmetricKey;

var EntityType      = mkm.protocol.EntityType;
var Address         = mkm.protocol.Address;
var ID              = mkm.protocol.ID;
var Meta            = mkm.protocol.Meta;
var Document        = mkm.protocol.Document;
var Visa            = mkm.protocol.Visa;
var Bulletin        = mkm.protocol.Bulletin;
var Identifier   = mkm.mkm.Identifier;
var SharedAccountExtensions = mkm.ext.SharedAccountExtensions;

var InstantMessage         = dkd.protocol.InstantMessage;
var SecureMessage          = dkd.protocol.SecureMessage;
var ReliableMessage        = dkd.protocol.ReliableMessage;
var Envelope               = dkd.protocol.Envelope;
var Content                = dkd.protocol.Content;
var Command                = dkd.protocol.Command;
var ContentType            = dkd.protocol.ContentType;
var ForwardContent         = dkd.protocol.ForwardContent;
var ArrayContent           = dkd.protocol.ArrayContent;
var MetaCommand            = dkd.protocol.MetaCommand;
var DocumentCommand        = dkd.protocol.DocumentCommand;
var GroupCommand           = dkd.protocol.GroupCommand;
var ReceiptCommand         = dkd.protocol.ReceiptCommand;
var BaseMessage      = dkd.msg.BaseMessage;
