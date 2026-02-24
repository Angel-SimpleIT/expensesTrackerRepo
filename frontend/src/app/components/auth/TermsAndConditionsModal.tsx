import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';

interface TermsAndConditionsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function TermsAndConditionsModal({ isOpen, onClose }: TermsAndConditionsModalProps) {
    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[600px] h-[80vh] flex flex-col p-0 overflow-hidden">
                <DialogHeader className="p-6 pb-2 shrink-0">
                    <DialogTitle>Términos y Condiciones de Uso</DialogTitle>
                    <DialogDescription>
                        Plataforma SaaS de Integración AI & WhatsApp
                    </DialogDescription>
                </DialogHeader>

                <ScrollArea className="flex-1 min-h-0 px-6">
                    <div className="space-y-6 text-sm text-[var(--neutral-700)] pb-6">
                        <section className="space-y-2">
                            <h3 className="text-base font-semibold text-[var(--neutral-900)]">1. Marco Introductorio y Objeto del Servicio</h3>
                            <p>
                                El presente documento constituye el contrato digital que regula el acceso y la utilización de la plataforma SaaS de integración de Inteligencia Artificial (IA) y mensajería a través de la WhatsApp Business API. En un entorno tecnológico marcado por la convergencia de modelos de lenguaje avanzados y flujos de datos automatizados, la aceptación de estos términos resulta imperativa para garantizar la seguridad jurídica de ambas partes y delimitar con precisión las responsabilidades en el uso de herramientas de procesamiento de lenguaje natural.
                            </p>
                            <p>
                                <strong>Condición de Usuario</strong><br />
                                De acuerdo con los estándares de transparencia y acceso digital, se considera Usuario a toda persona física o jurídica que acceda, recorra o utilice el sitio y sus servicios, ya sea de forma directa o mediante aplicaciones informáticas. El acceso al portal implica la aceptación plena y sin reservas de todas las disposiciones contenidas en la versión publicada al momento del acceso. El servicio tiene un carácter centralizado, funcionando como punto de enlace a herramientas de terceros, cuya capacidad técnica y disponibilidad condicionan intrínsecamente la prestación de este servicio.
                            </p>
                        </section>

                        <section className="space-y-2">
                            <h3 className="text-base font-semibold text-[var(--neutral-900)]">2. Deslinde de Responsabilidad y Limitaciones Técnicas (Disclaimer)</h3>
                            <p>
                                La naturaleza de las tecnologías emergentes y los servicios de infraestructura de red conlleva riesgos que el Usuario reconoce y acepta al utilizar la plataforma. El presente deslinde constituye la piedra angular de la sostenibilidad operativa del servicio.
                            </p>
                            <ul className="list-disc pl-5 space-y-1">
                                <li><strong>Disponibilidad y Fallos de Terceros (API de Meta/WhatsApp):</strong> La plataforma depende de infraestructuras externas, específicamente de la WhatsApp Business API (Meta). En concordancia con los estándares de gub.uy, el prestador se exonera de responsabilidad por daños y perjuicios de toda naturaleza derivados de la falta de disponibilidad, caídas del sistema o fallos técnicos en los servicios de terceros que impidan el acceso o el correcto funcionamiento de la mensajería.</li>
                                <li><strong>Alucinaciones de IA y Precisión del Contenido:</strong> Las respuestas generadas por modelos de lenguaje (LLM) son el resultado de procesamientos probabilísticos. Siguiendo el principio de responsabilidad de la fuente, la veracidad, integridad y precisión del contenido generado son de exclusiva responsabilidad de quien proporciona los datos originales (Inputs). El Usuario reconoce que la IA puede generar información inexacta o incoherente ("alucinaciones") y que el prestador no asume responsabilidad alguna por el uso comercial o legal que se le dé a dichos resultados.</li>
                                <li><strong>Infalibilidad de Sistemas:</strong> Se deslinda toda responsabilidad por fallos técnicos que resulten en la pérdida de datos o interrupciones de acceso, dado que no es posible garantizar la invulnerabilidad absoluta de los sistemas informáticos ante contingencias externas.</li>
                            </ul>
                        </section>

                        <section className="space-y-2">
                            <h3 className="text-base font-semibold text-[var(--neutral-900)]">3. Propiedad Intelectual en Activos Generados por IA</h3>
                            <p>
                                Bajo el marco de la Ley N° 9.739 (Ley de Derechos de Autor) de la República Oriental del Uruguay y estándares internacionales, la titularidad de los activos digitales se define de la siguiente manera:
                            </p>
                            <ul className="list-disc pl-5 space-y-1">
                                <li><strong>Signos Distintivos:</strong> Todas las marcas, nombres comerciales y logotipos presentes en la plataforma son propiedad del prestador o de terceros. El acceso al servicio no atribuye derecho alguno sobre estos activos de propiedad industrial. Queda terminantemente prohibido su uso sin autorización expresa.</li>
                                <li><strong>Inputs y Outputs:</strong> El Usuario conserva la titularidad sobre los datos de entrada (Inputs) suministrados. Respecto a los resultados generados (Outputs), el Usuario obtiene un derecho de uso exclusivo para sus fines comerciales, sin perjuicio de las limitaciones derivadas de las licencias de los modelos de lenguaje utilizados.</li>
                                <li><strong>Reserva de Derechos:</strong> El prestador se reserva el derecho de actuar por los medios pertinentes contra cualquier utilización que infrinja derechos de propiedad intelectual propios o de terceros.</li>
                            </ul>
                        </section>

                        <section className="space-y-2">
                            <h3 className="text-base font-semibold text-[var(--neutral-900)]">4. Política de Tratamiento de Datos y Seguridad (Ley N° 18.331)</h3>
                            <p>
                                El flujo de datos entre el Usuario, la API de WhatsApp y el motor de almacenamiento de datos cumple con la Ley N° 18.331 de Protección de Datos Personales y Acción de "Habeas Data" de Uruguay.
                            </p>
                            <ul className="list-disc pl-5 space-y-1">
                                <li><strong>Roles en el Tratamiento:</strong> Según el DPA de Supabase, el Usuario actúa como Responsable del Tratamiento (Controller/Business) y el SaaS actúa como Encargado del Tratamiento (Processor/Service Provider).</li>
                                <li><strong>Infraestructura y Cifrado:</strong> Los datos se procesan mediante la infraestructura de Supabase, aplicando cifrado AES-256 para datos en reposo y protocolos TLS (Transport Layer Security) para datos en tránsito. Las claves de cifrado están protegidas mediante módulos de seguridad de hardware (HSM) conformes a FIPS 140-2.</li>
                                <li><strong>Categorías de Datos:</strong> Se procesa información de contacto (nombre, email), registros de cuenta y metadatos de uso relacionados con Usuarios Autorizados.</li>
                                <li><strong>Política de Retención (SOFTEJ):</strong>
                                    <ul className="list-circle pl-5 mt-1 space-y-1">
                                        <li>Registros técnicos y WABA ID: Los metadatos de mensajería se eliminan o anonimizan en un plazo máximo de 30 días.</li>
                                        <li>Copias de Seguridad: Se mantienen respaldos cifrados por un ciclo técnico de hasta 90 días para garantizar la continuidad del servicio.</li>
                                    </ul>
                                </li>
                                <li><strong>Derechos ARCO:</strong> El Usuario podrá ejercer sus derechos de acceso, rectificación, cancelación y oposición. Para la eliminación de datos, deberá enviar un correo a <a href="mailto:info@softej.com" className="text-[var(--primary-main)] hover:underline">info@softej.com</a> especificando:
                                    <ol className="list-decimal pl-5 mt-1 space-y-1">
                                        <li>Número de teléfono de la cuenta WhatsApp Business.</li>
                                        <li>Nombre de la empresa.</li>
                                        <li>Descripción de la solicitud.</li>
                                    </ol>
                                    El proceso de verificación de identidad es requisito previo a la ejecución de la baja.
                                </li>
                            </ul>
                        </section>

                        <section className="space-y-2">
                            <h3 className="text-base font-semibold text-[var(--neutral-900)]">5. Política de Uso Aceptable y Prohibiciones</h3>
                            <p>El mantenimiento de la integridad del ecosistema digital es una responsabilidad compartida. El Usuario se obliga a:</p>
                            <ul className="list-disc pl-5 space-y-1">
                                <li><strong>Prohibición de Spam:</strong> No utilizar la API para el envío de comunicaciones masivas no solicitadas o con fines ilícitos que vulneren la normativa nacional uruguaya.</li>
                                <li><strong>Integridad del Sistema:</strong> En cumplimiento con las directivas de seguridad informática, se prohíbe dañar, inutilizar o sobrecargar los servidores, así como intentar obtener acceso no autorizado mediante versiones modificadas de software o cualquier técnica de intrusión. Cualquier interferencia con las redes conectadas será considerada falta grave y causal de terminación inmediata.</li>
                            </ul>
                        </section>

                        <section className="space-y-2">
                            <h3 className="text-base font-semibold text-[var(--neutral-900)]">6. Jurisdicción y Resolución de Controversias</h3>
                            <p>Para garantizar la eficiencia legal y la especialización en la defensa, las partes acuerdan:</p>
                            <ul className="list-disc pl-5 space-y-1">
                                <li><strong>Tribunales Competentes:</strong> Toda controversia derivada de la interpretación de estos términos será competencia exclusiva de los jueces y tribunales ordinarios de la ciudad de Montevideo, Uruguay. Esta jurisdicción se fundamenta en la robusta estructura administrativa del Poder Judicial uruguayo, incluyendo la especialización técnica de la Oficina de Recepción y Distribución de Asuntos (ORDA) y el Departamento de Información y Documentación Judicial (DIDOJ), conforme a las Acordadas 7520 y 7531.</li>
                                <li><strong>Ley Aplicable:</strong> La ley sustantiva y procesal aplicable será la de la República Oriental del Uruguay.</li>
                            </ul>
                        </section>

                        <section className="space-y-2">
                            <h3 className="text-base font-semibold text-[var(--neutral-900)]">7. Disposiciones Finales, Duración y Contacto</h3>
                            <ul className="list-disc pl-5 space-y-1">
                                <li><strong>Modificaciones:</strong> El prestador se reserva la facultad de modificar estos términos en cualquier momento. Las nuevas versiones entrarán en vigor tras su publicación en el portal.</li>
                                <li><strong>Terminación:</strong> El servicio tiene duración indeterminada, pero podrá ser suspendido temporal o definitivamente, total o parcialmente, sin expresión de causa y sin responsabilidad por parte del prestador, conforme a la facultad de cancelación discrecional reconocida en estándares de administración digital.</li>
                                <li><strong>Contacto y Denuncias:</strong> Ante situaciones irregulares, contenidos erróneos o consultas legales, el canal oficial es el correo electrónico: <a href="mailto:angel@simpleit.uy" className="text-[var(--primary-main)] hover:underline">angel@simpleit.uy</a></li>
                            </ul>
                            <p className="mt-4 font-medium italic">
                                Este documento constituye el acuerdo total entre las partes, aceptado por el Usuario al momento de acceder o registrarse en la plataforma.
                            </p>
                        </section>
                    </div>
                </ScrollArea>

                <DialogFooter className="p-6 pt-2 shrink-0 border-t border-[var(--neutral-200)] mt-auto bg-white dark:bg-zinc-950">
                    <Button onClick={onClose} className="w-full sm:w-auto">
                        Cerrar
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
