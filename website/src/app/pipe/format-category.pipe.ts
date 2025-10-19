import {Pipe, PipeTransform} from "@angular/core";

@Pipe({
	name: "formatCategory",
	pure: true,
	standalone: true,
})
export class FormatCategoryPipe implements PipeTransform {

	transform(category: string): string {
		const categorySplit = category.split("-");
		return categorySplit[categorySplit.length - 1];
	}
}
