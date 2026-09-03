import { OmitType, PartialType } from "@nestjs/swagger";
import { CreateAssistantDto } from "./create-assistant.dto";

export class UpdateAssistantDto extends PartialType(
  OmitType(CreateAssistantDto, ["password"] as const),
) {}
