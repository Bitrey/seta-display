# SETA Display

Un sistema che, scaricando i dati in tempo reale degli arrivi e delle partenze degli autobus ad una certa fermata tramite le API di SETA e TPER, li mostra su un'interfaccia grafica.

Il server, scritto interamente in TypeScript, è in grado di gestire un numero elevatissimo di richieste: i dati di una fermata vengono temporaneamente salvati come cache tramite **Redis**.
In produzione viene utilizzato un server Nginx.

Il client utilizza React e Tailwind CSS.

Il tutto è Dockerizzato per permettere l'esecuzione da qualunque ambiente di lavoro.
