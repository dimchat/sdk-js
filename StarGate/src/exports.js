;

if (typeof DIMP.lnc !== 'object') {
    DIMP.lnc = {};
}
LocalNotificationService.exports(DIMP.lnc);

if (typeof DIMP.fsm !== 'object') {
    DIMP.fsm = {};
}
FiniteStateMachine.exports(DIMP.fsm);

if (typeof DIMP.dos !== 'object') {
    DIMP.dos = {};
}
FileSystem.exports(DIMP.dos);

if (typeof DIMP.startrek !== 'object') {
    DIMP.startrek = {};
}
StarTrek.exports(DIMP.startrek);

if (typeof DIMP.stargate !== 'object') {
    DIMP.stargate = {};
}
StarGate.exports(DIMP.stargate);
