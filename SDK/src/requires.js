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
var Converter      = mk.type.Converter;
var Wrapper        = mk.type.Wrapper;
var Mapper         = mk.type.Mapper;
var Stringer       = mk.type.Stringer;
var IObject        = mk.type.Object;
var BaseObject     = mk.type.BaseObject;
var ConstantString = mk.type.ConstantString;
var Dictionary     = mk.type.Dictionary;
var Arrays         = mk.type.Arrays;
var StringCoder         = mk.format.StringCoder;
var UTF8                = mk.format.UTF8;
var ObjectCoder         = mk.format.ObjectCoder;
//var JSON              = mk.format.JSON;
var JSONMap             = mk.format.JSONMap;
var DataCoder           = mk.format.DataCoder;
var Base58              = mk.format.Base58;
var Base64              = mk.format.Base64;
var Hex                 = mk.format.Hex;
var BaseDataWrapper     = mk.format.BaseDataWrapper;
var BaseFileWrapper     = mk.format.BaseFileWrapper;
var MessageDigester = mk.digest.MessageDigester;
var SHA256          = mk.digest.SHA256;
var RIPEMD160       = mk.digest.RIPEMD160;
var KECCAK256       = mk.digest.KECCAK256;
var EncodeAlgorithms     = mk.protocol.EncodeAlgorithms;
var TransportableData    = mk.protocol.TransportableData;
var PortableNetworkFile  = mk.protocol.PortableNetworkFile;
var SymmetricAlgorithms  = mk.protocol.SymmetricAlgorithms;
var AsymmetricAlgorithms = mk.protocol.AsymmetricAlgorithms;
var EncryptKey           = mk.protocol.EncryptKey;
var DecryptKey           = mk.protocol.DecryptKey;
var VerifyKey            = mk.protocol.VerifyKey;
var SymmetricKey         = mk.protocol.SymmetricKey;
var SymmetricKeyFactory  = mk.protocol.SymmetricKey.Factory;
var AsymmetricKey        = mk.protocol.AsymmetricKey;
var PublicKey            = mk.protocol.PublicKey;
var PublicKeyFactory     = mk.protocol.PublicKey.Factory;
var PrivateKey           = mk.protocol.PrivateKey;
var PrivateKeyFactory    = mk.protocol.PrivateKey.Factory;
var BaseSymmetricKey = mk.crypto.BaseSymmetricKey;
var BasePublicKey    = mk.crypto.BasePublicKey;
var BasePrivateKey   = mk.crypto.BasePrivateKey;
var GeneralCryptoHelper       = mk.ext.GeneralCryptoHelper;
var SymmetricKeyHelper        = mk.ext.SymmetricKeyHelper;
var PrivateKeyHelper          = mk.ext.PrivateKeyHelper;
var PublicKeyHelper           = mk.ext.PublicKeyHelper;
var GeneralFormatHelper       = mk.ext.GeneralFormatHelper;
var PortableNetworkFileHelper = mk.ext.PortableNetworkFileHelper;
var TransportableDataHelper   = mk.ext.TransportableDataHelper;
var SharedCryptoExtensions    = mk.ext.SharedCryptoExtensions;
var SharedFormatExtensions    = mk.ext.SharedFormatExtensions;

var EntityType      = mkm.protocol.EntityType;
var Address         = mkm.protocol.Address;
var AddressFactory  = mkm.protocol.Address.Factory;
var ID              = mkm.protocol.ID;
var IDFactory       = mkm.protocol.ID.Factory;
var Meta            = mkm.protocol.Meta;
var MetaFactory     = mkm.protocol.Meta.Factory;
var Document        = mkm.protocol.Document;
var DocumentFactory = mkm.protocol.Document.Factory;
var Visa            = mkm.protocol.Visa;
var Bulletin        = mkm.protocol.Bulletin;
var MetaType        = mkm.protocol.MetaType;
var DocumentType    = mkm.protocol.DocumentType;
var Identifier   = mkm.mkm.Identifier;
var BaseMeta     = mkm.mkm.BaseMeta;
var BaseDocument = mkm.mkm.BaseDocument;
var BaseBulletin = mkm.mkm.BaseBulletin;
var BaseVisa     = mkm.mkm.BaseVisa;
var GeneralAccountHelper    = mkm.ext.GeneralAccountHelper;
var AddressHelper           = mkm.ext.AddressHelper;
var IdentifierHelper        = mkm.ext.IdentifierHelper;
var MetaHelper              = mkm.ext.MetaHelper;
var DocumentHelper          = mkm.ext.DocumentHelper;
var SharedAccountExtensions = mkm.ext.SharedAccountExtensions;

var InstantMessage         = dkd.protocol.InstantMessage;
var InstantMessageFactory  = dkd.protocol.InstantMessage.Factory;
var SecureMessage          = dkd.protocol.SecureMessage;
var SecureMessageFactory   = dkd.protocol.SecureMessage.Factory;
var ReliableMessage        = dkd.protocol.ReliableMessage;
var ReliableMessageFactory = dkd.protocol.ReliableMessage.Factory;
var Envelope               = dkd.protocol.Envelope;
var EnvelopeFactory        = dkd.protocol.Envelope.Factory;
var Content                = dkd.protocol.Content;
var ContentFactory         = dkd.protocol.Content.Factory;
var Command                = dkd.protocol.Command;
var CommandFactory         = dkd.protocol.Command.Factory;
var ContentType            = dkd.protocol.ContentType;
var ForwardContent         = dkd.protocol.ForwardContent;
var ArrayContent           = dkd.protocol.ArrayContent;
var MetaCommand            = dkd.protocol.MetaCommand;
var DocumentCommand        = dkd.protocol.DocumentCommand;
var GroupCommand           = dkd.protocol.GroupCommand;
var ReceiptCommand         = dkd.protocol.ReceiptCommand;
var MessageEnvelope  = dkd.msg.MessageEnvelope;
var BaseMessage      = dkd.msg.BaseMessage;
var PlainMessage     = dkd.msg.PlainMessage;
var EncryptedMessage = dkd.msg.EncryptedMessage;
var NetworkMessage   = dkd.msg.NetworkMessage;
var BaseContent           = dkd.dkd.BaseContent;
var BaseTextContent       = dkd.dkd.BaseTextContent;
var BaseFileContent       = dkd.dkd.BaseFileContent;
var ImageFileContent      = dkd.dkd.ImageFileContent;
var AudioFileContent      = dkd.dkd.AudioFileContent;
var VideoFileContent      = dkd.dkd.VideoFileContent;
var WebPageContent        = dkd.dkd.WebPageContent;
var NameCardContent       = dkd.dkd.NameCardContent;
var BaseQuoteContent      = dkd.dkd.BaseQuoteContent;
var BaseMoneyContent      = dkd.dkd.BaseMoneyContent;
var TransferMoneyContent  = dkd.dkd.TransferMoneyContent;
var ListContent           = dkd.dkd.ListContent;
var CombineForwardContent = dkd.dkd.CombineForwardContent;
var SecretContent         = dkd.dkd.SecretContent;
var AppCustomizedContent  = dkd.dkd.AppCustomizedContent;
var BaseCommand           = dkd.dkd.BaseCommand;
var BaseMetaCommand       = dkd.dkd.BaseMetaCommand;
var BaseDocumentCommand   = dkd.dkd.BaseDocumentCommand;
var BaseReceiptCommand    = dkd.dkd.BaseReceiptCommand;
var BaseHistoryCommand    = dkd.dkd.BaseHistoryCommand;
var BaseGroupCommand      = dkd.dkd.BaseGroupCommand;
var InviteGroupCommand    = dkd.dkd.InviteGroupCommand;
var ExpelGroupCommand     = dkd.dkd.ExpelGroupCommand;
var JoinGroupCommand      = dkd.dkd.JoinGroupCommand;
var QuitGroupCommand      = dkd.dkd.QuitGroupCommand;
// var QueryGroupCommand  = dkd.dkd.QueryGroupCommand;
var ResetGroupCommand     = dkd.dkd.ResetGroupCommand;
var HireGroupCommand      = dkd.dkd.HireGroupCommand;
var FireGroupCommand      = dkd.dkd.FireGroupCommand;
var ResignGroupCommand    = dkd.dkd.ResignGroupCommand;
var GeneralMessageHelper    = dkd.ext.GeneralMessageHelper;
var ContentHelper           = dkd.ext.ContentHelper;
var EnvelopeHelper          = dkd.ext.EnvelopeHelper;
var InstantMessageHelper    = dkd.ext.InstantMessageHelper;
var SecureMessageHelper     = dkd.ext.SecureMessageHelper;
var ReliableMessageHelper   = dkd.ext.ReliableMessageHelper;
var GeneralCommandHelper    = dkd.ext.GeneralCommandHelper;
var CommandHelper           = dkd.ext.CommandHelper;
var SharedCommandExtensions = dkd.ext.SharedCommandExtensions;
var SharedMessageExtensions = dkd.ext.SharedMessageExtensions;

