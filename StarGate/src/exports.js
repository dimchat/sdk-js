;

if (typeof DIMSDK !== 'object') {
    DIMSDK = new MONKEY.Namespace();
}

if (typeof DIMSDK.lnc !== 'object') {
    DIMSDK.lnc = new MONKEY.Namespace();
}
LocalNotificationService.exports(DIMSDK.lnc);

if (typeof DIMSDK.fsm !== 'object') {
    DIMSDK.fsm = new MONKEY.Namespace();
}
FiniteStateMachine.exports(DIMSDK.fsm);

if (typeof DIMSDK.dos !== 'object') {
    DIMSDK.dos = new MONKEY.Namespace();
}
FileSystem.exports(DIMSDK.dos);

if (typeof DIMSDK.startrek !== 'object') {
    DIMSDK.startrek = new MONKEY.Namespace();
}
StarTrek.exports(DIMSDK.startrek);

if (typeof DIMSDK.stargate !== 'object') {
    DIMSDK.stargate = new MONKEY.Namespace();
}
StarGate.exports(DIMSDK.stargate);
