package au.csiro.data61.magda.registry

import _root_.au.csiro.data61.magda.model.{
  RegistryProtocols => CommonRegistryProtocols,
}
import _root_.au.csiro.data61.magda.model.RegistryModel._
import gnieh.diffson.sprayJson._

final case class ReadyStatus(ready: Boolean = false)

trait Protocols extends DiffsonProtocol with CommonRegistryProtocols {
  implicit val badRequestFormat = jsonFormat1(BadRequest.apply)
  implicit val recordsPageFormat = jsonFormat3(RecordsPage.apply[Record])
  implicit val recordSummariesPageFormat = jsonFormat3(
    RecordsPage.apply[RecordSummary]
  )
  implicit val recordSummariesPageFormat2 = jsonFormat3(
    RecordsPage.apply[RecordType]
  )
  implicit val patchAspectDefinitionEventFormat = jsonFormat3(
    PatchAspectDefinitionEvent.apply
  )
  implicit val createAspectDefinitionEventFormat = jsonFormat4(
    CreateAspectDefinitionEvent.apply
  )
  implicit val createRecordEventFormat = jsonFormat3(CreateRecordEvent.apply)
  implicit val createRecordAspectEventFormat = jsonFormat4(
    CreateRecordAspectEvent.apply
  )
  implicit val deleteRecordAspectEventFormat = jsonFormat3(
    DeleteRecordAspectEvent.apply
  )
  implicit val patchRecordEventFormat = jsonFormat3(PatchRecordEvent.apply)
  implicit val patchRecordAspectEventFormat = jsonFormat4(
    PatchRecordAspectEvent.apply
  )
  implicit val deleteRecordEventFormat = jsonFormat2(DeleteRecordEvent.apply)
  implicit val deleteResultFormat = jsonFormat1(DeleteResult.apply)
  implicit val multipleDeleteResultFormat = jsonFormat1(
    MultipleDeleteResult.apply
  )
  implicit val eventsPageFormat = jsonFormat3(EventsPage.apply)
  implicit val webHookResponseFormat = jsonFormat1(WebHookResponse.apply)
  implicit val countResponseFormat = jsonFormat1(CountResponse.apply)
  implicit val readyState = jsonFormat1(ReadyStatus.apply)
}
