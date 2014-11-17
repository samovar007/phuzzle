<?php
namespace Dml;
/**
 *
 * @author vsamoylov
 */
class TransportLoggerConsole extends TransportLoggerAbstract {
	public function write($_str) {
		echo $_str . BR;
	}
}

